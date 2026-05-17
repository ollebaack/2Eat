using _2Eat.Domain;
using Microsoft.Extensions.Logging;
using System.Net;
using System.Text.RegularExpressions;
using System.Xml;

namespace _2Eat.Infrastructure.Utforska.Scrapers;

/// <summary>
/// Scrapes recipe data from coop.se using their XML sitemap.
///
/// Investigation summary (2026-05-17):
/// - Listing pages (/recept/, /recept/middagsrecept/) are a JavaScript SPA — the initial
///   HTML response contains no recipe links or data, so regex-based scraping of those pages
///   yields zero results.
/// - RSS/feed endpoints (/recept/feed/, /feed/, /rss) returned 404.
/// - JSON-LD, __NEXT_DATA__, or window.__STATE__ are absent from the SPA shell HTML.
/// - The site exposes a well-maintained XML sitemap at https://www.coop.se/recept/sitemap.xml
///   listing 9 000+ individual recipe URLs (format: /recept/[slug]/).
/// - Individual recipe pages ARE server-side rendered for their &lt;head&gt; section and include
///   og:title (e.g. "Ajvarkyckling | Recept - Coop") and og:image (Cloudinary CDN URL).
///
/// Approach: parse the sitemap for recipe URLs, then concurrently fetch a limited number of
/// individual pages to extract og:title and og:image from the SSR HTML head.
/// </summary>
public class CoopScraper : ListingPageScraper
{
    private const string SitemapUrl = "https://www.coop.se/recept/sitemap.xml";
    private const int ConcurrencyLimit = 8;
    private static readonly string TitleSuffix = " | Recept - Coop";

    // Matches: <meta name="og:title" content="..." />
    private static readonly Regex OgTitlePattern = new(
        @"<meta\s[^>]*name=""og:title""\s[^>]*content=""([^""]+)""",
        RegexOptions.IgnoreCase | RegexOptions.Compiled);

    // Matches: <meta name="og:image" content="..." />
    private static readonly Regex OgImagePattern = new(
        @"<meta\s[^>]*name=""og:image""\s[^>]*content=""([^""]+)""",
        RegexOptions.IgnoreCase | RegexOptions.Compiled);

    public CoopScraper(IHttpClientFactory httpFactory, ILogger<CoopScraper> logger)
        : base(httpFactory, logger) { }

    public override string SourceSite => "Coop";

    // Not used — ScrapeAsync is fully overridden below.
    protected override IReadOnlyList<string> ListingUrls => [];
    protected override Regex RecipeCardPattern { get; } = new("^$", RegexOptions.Compiled);
    protected override string ResolveUrl(string href) =>
        href.StartsWith("http", StringComparison.OrdinalIgnoreCase)
            ? href
            : $"https://www.coop.se{href}";

    /// <summary>
    /// Parses the Coop recipe sitemap to discover recipe URLs, then fetches individual
    /// recipe pages in parallel to extract og:title and og:image.
    /// </summary>
    public override async Task<List<Forslag>> ScrapeAsync(int maxPerSource, CancellationToken ct)
    {
        var http = _httpFactory.CreateClient("ForslagScraper");

        List<string> recipeUrls;
        try
        {
            recipeUrls = await ParseSitemapAsync(http, maxPerSource, ct);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to fetch or parse Coop sitemap from {Url}", SitemapUrl);
            return [];
        }

        if (recipeUrls.Count == 0)
        {
            _logger.LogWarning("Coop sitemap returned no recipe URLs");
            return [];
        }

        // Fetch individual recipe pages with bounded concurrency
        var semaphore = new SemaphoreSlim(ConcurrencyLimit);
        var fetchTasks = recipeUrls.Select(url => FetchForslagAsync(http, url, semaphore, ct));
        var results = await Task.WhenAll(fetchTasks);

        var forslag = results.OfType<Forslag>().ToList();
        _logger.LogInformation("Scraped {Count} Förslag from {Site}", forslag.Count, SourceSite);
        return forslag;
    }

    private async Task<List<string>> ParseSitemapAsync(HttpClient http, int limit, CancellationToken ct)
    {
        using var stream = await http.GetStreamAsync(SitemapUrl, ct);

        var urls = new List<string>(limit);
        var settings = new XmlReaderSettings { Async = true };

        using var reader = XmlReader.Create(stream, settings);
        while (await reader.ReadAsync() && urls.Count < limit)
        {
            if (reader.NodeType == XmlNodeType.Element &&
                reader.LocalName == "loc" &&
                reader.NamespaceURI == "http://www.sitemaps.org/schemas/sitemap/0.9")
            {
                var loc = await reader.ReadElementContentAsStringAsync();
                // Only include direct recipe pages: /recept/[slug]/ (exactly two path segments)
                if (IsRecipeUrl(loc))
                    urls.Add(loc);
            }
        }

        return urls;
    }

    private static bool IsRecipeUrl(string url)
    {
        // Accept URLs like https://www.coop.se/recept/ajvarkyckling/
        // Reject category URLs like https://www.coop.se/recept/vegetariskt/ajvarkyckling/
        if (!url.StartsWith("https://www.coop.se/recept/", StringComparison.OrdinalIgnoreCase))
            return false;

        var path = url["https://www.coop.se".Length..].TrimEnd('/');
        // path should be /recept/<slug> — exactly 2 segments
        var segments = path.Split('/', StringSplitOptions.RemoveEmptyEntries);
        return segments.Length == 2;
    }

    private async Task<Forslag?> FetchForslagAsync(HttpClient http, string url, SemaphoreSlim semaphore, CancellationToken ct)
    {
        await semaphore.WaitAsync(ct);
        try
        {
            var html = await http.GetStringAsync(url, ct);

            var titleMatch = OgTitlePattern.Match(html);
            var imageMatch = OgImagePattern.Match(html);

            if (!titleMatch.Success)
            {
                _logger.LogDebug("No og:title found on Coop recipe page {Url}", url);
                return null;
            }

            var rawTitle = WebUtility.HtmlDecode(titleMatch.Groups[1].Value.Trim());
            var title = rawTitle.EndsWith(TitleSuffix, StringComparison.OrdinalIgnoreCase)
                ? rawTitle[..^TitleSuffix.Length].Trim()
                : rawTitle;

            var imageUrl = imageMatch.Success
                ? WebUtility.HtmlDecode(imageMatch.Groups[1].Value.Trim())
                : null;

            return new Forslag
            {
                Title = title,
                SourceUrl = url,
                SourceSite = SourceSite,
                ImageUrl = imageUrl,
                FetchedAt = DateTimeOffset.UtcNow,
            };
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to fetch Coop recipe page {Url}", url);
            return null;
        }
        finally
        {
            semaphore.Release();
        }
    }
}

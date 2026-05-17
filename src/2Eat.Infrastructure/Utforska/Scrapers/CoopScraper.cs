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

    // OpenGraph uses property="og:title"; some older implementations use name="og:title".
    // Each regex handles both attribute orderings (property/name before or after content).
    private static readonly Regex OgTitlePattern = new(
        @"<meta\b[^>]*\b(?:property|name)=""og:title""[^>]*\bcontent=""([^""]+)""" +
        @"|<meta\b[^>]*\bcontent=""([^""]+)""[^>]*\b(?:property|name)=""og:title""",
        RegexOptions.IgnoreCase | RegexOptions.Compiled);

    private static readonly Regex OgImagePattern = new(
        @"<meta\b[^>]*\b(?:property|name)=""og:image""[^>]*\bcontent=""([^""]+)""" +
        @"|<meta\b[^>]*\bcontent=""([^""]+)""[^>]*\b(?:property|name)=""og:image""",
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

            // Groups: 1 = property-before-content match, 2 = content-before-property match
            var rawTitle = WebUtility.HtmlDecode(
                (titleMatch.Groups[1].Value.Trim() is { Length: > 0 } g1t ? g1t : titleMatch.Groups[2].Value.Trim()));

            // Category pages (e.g. /recept/vegetariskt/) have two path segments but are not
            // individual recipes — their og:title does not end with the recipe suffix.
            if (!rawTitle.EndsWith(TitleSuffix, StringComparison.OrdinalIgnoreCase))
            {
                _logger.LogDebug("Skipping non-recipe Coop page {Url}, title: {Title}", url, rawTitle);
                return null;
            }

            var title = rawTitle[..^TitleSuffix.Length].Trim();

            string? rawImageUrl = null;
            if (imageMatch.Success)
            {
                var g1i = imageMatch.Groups[1].Value.Trim();
                var g2i = imageMatch.Groups[2].Value.Trim();
                rawImageUrl = g1i.Length > 0 ? g1i : g2i;
                if (rawImageUrl.Length == 0) rawImageUrl = null;
            }
            var imageUrl = rawImageUrl is not null ? WebUtility.HtmlDecode(rawImageUrl) : null;

            var ingredientNames = ExtractIngredientNames(html)
                .Select(n => new ForslagIngredientName { Name = n })
                .ToList();

            return new Forslag
            {
                Title = title,
                SourceUrl = url,
                SourceSite = SourceSite,
                ImageUrl = imageUrl,
                FetchedAt = DateTimeOffset.UtcNow,
                IngredientNames = ingredientNames,
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

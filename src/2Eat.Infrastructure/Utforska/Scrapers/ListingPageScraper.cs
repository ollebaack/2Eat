using _2Eat.Domain;
using Microsoft.Extensions.Logging;
using System.Net;
using System.Text.RegularExpressions;

namespace _2Eat.Infrastructure.Utforska.Scrapers;

/// <summary>
/// Base class for listing-page HTML scrapers.
/// Fetches a set of listing URLs, extracts recipe card links, title, and image
/// using site-specific patterns. Failures are logged and result in empty lists.
/// </summary>
public abstract class ListingPageScraper
{
    protected readonly IHttpClientFactory _httpFactory;
    protected readonly ILogger _logger;

    protected ListingPageScraper(IHttpClientFactory httpFactory, ILogger logger)
    {
        _httpFactory = httpFactory;
        _logger = logger;
    }

    public abstract string SourceSite { get; }
    protected abstract IReadOnlyList<string> ListingUrls { get; }

    /// <summary>
    /// Regex that matches a recipe anchor tag in the site's listing HTML.
    /// Must capture groups: 1=href, 2=title (or alt text)
    /// </summary>
    protected abstract Regex RecipeCardPattern { get; }

    /// <summary>
    /// Regex to extract the image URL from a recipe card block.
    /// Must capture group 1=image src.
    /// Override when the site's image is in a srcset, data-src, etc.
    /// </summary>
    protected virtual Regex? ImagePattern => null;

    /// <summary>
    /// Normalise a relative href to an absolute URL.
    /// </summary>
    protected abstract string ResolveUrl(string href);

    public virtual async Task<List<Forslag>> ScrapeAsync(int maxPerSource, CancellationToken ct)
    {
        var results = new List<Forslag>();
        var seen = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

        var http = _httpFactory.CreateClient("ForslagScraper");

        foreach (var listingUrl in ListingUrls)
        {
            if (results.Count >= maxPerSource) break;
            try
            {
                var html = await http.GetStringAsync(listingUrl, ct);
                var cards = ExtractCards(html, maxPerSource - results.Count, seen);
                results.AddRange(cards);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to scrape listing page {Url} for {Site}", listingUrl, SourceSite);
            }
        }

        // Enrich each card with ingredient names from its detail page
        var sem = new SemaphoreSlim(5);
        await Task.WhenAll(results.Select(async forslag =>
        {
            await sem.WaitAsync(ct);
            try
            {
                var detailHtml = await http.GetStringAsync(forslag.SourceUrl, ct);
                forslag.IngredientNames = ExtractIngredientNames(detailHtml)
                    .Select(n => new ForslagIngredientName { Name = n })
                    .ToList();

                // Prefer the detail page's <h1> as the canonical recipe title — listing-page
                // anchor text can be truncated or pick up unrelated prose near the link.
                var detailTitle = ExtractH1Title(detailHtml);
                if (detailTitle is not null)
                    forslag.Title = detailTitle;

                // Detail-page og:image is typically the full-resolution hero image, while
                // listing-page thumbnails are often low-res and appear blurry when enlarged.
                var detailImage = ExtractOgImage(detailHtml);
                if (detailImage is not null)
                    forslag.ImageUrl = detailImage;
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to extract ingredients from {Url}", forslag.SourceUrl);
                forslag.IngredientNames = [];
            }
            finally
            {
                sem.Release();
            }
        }));

        // Safety net: discard anything for which no ingredient names could be extracted.
        // Non-recipe pages (chef profiles, category listings, etc.) contain no schema.org
        // recipeIngredient data, so they always produce zero ingredients after enrichment.
        // Genuine recipes that failed to load their detail page also get filtered here, which
        // is preferable to surfacing ingredient-free cards to the user.
        var beforeFilter = results.Count;
        results = results.Where(f => f.IngredientNames.Count > 0).ToList();
        var filtered = beforeFilter - results.Count;
        if (filtered > 0)
            _logger.LogInformation("Filtered {Filtered} non-recipe Förslag (zero ingredients) from {Site}", filtered, SourceSite);

        _logger.LogInformation("Scraped {Count} Förslag from {Site}", results.Count, SourceSite);
        return results;
    }

    /// <summary>
    /// Extracts ingredient name strings from a recipe detail page HTML.
    /// Uses the schema.org JSON-LD recipeIngredient property (present on most Swedish recipe sites).
    /// Override in subclasses for sites with a different structure.
    /// </summary>
    protected virtual List<string> ExtractIngredientNames(string html)
    {
        var blockMatch = Regex.Match(
            html,
            @"""recipeIngredient""\s*:\s*\[([^\]]+)\]",
            RegexOptions.IgnoreCase);

        if (!blockMatch.Success) return [];

        var block = blockMatch.Groups[1].Value;
        return Regex.Matches(block, @"""([^""]{2,100})""")
            .Select(m => WebUtility.HtmlDecode(m.Groups[1].Value.Trim().ToLowerInvariant()))
            .Where(s => s.Length >= 2)
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();
    }

    private static readonly Regex H1Pattern = new(
        @"<h1\b[^>]*>(.*?)</h1>",
        RegexOptions.IgnoreCase | RegexOptions.Singleline | RegexOptions.Compiled);

    /// <summary>
    /// Extracts the recipe title from the detail page's &lt;h1&gt; element, stripping any
    /// nested tags and decoding HTML entities. Returns null if no plausible title is found.
    /// </summary>
    private static string? ExtractH1Title(string html)
    {
        var match = H1Pattern.Match(html);
        if (!match.Success) return null;

        var text = WebUtility.HtmlDecode(Regex.Replace(match.Groups[1].Value, "<[^>]+>", " "));
        text = Regex.Replace(text, @"\s+", " ").Trim();

        return text.Length is >= 3 and <= 120 ? text : null;
    }

    private static string? ExtractOgImage(string html)
    {
        var match = Regex.Match(html,
            @"<meta[^>]+property=""og:image""[^>]+content=""([^""]*)""|<meta[^>]+content=""([^""]*)""[^>]+property=""og:image""",
            RegexOptions.IgnoreCase);
        if (!match.Success) return null;
        var raw = match.Groups[1].Success ? match.Groups[1].Value : match.Groups[2].Value;
        return raw.Length > 0 ? WebUtility.HtmlDecode(raw) : null;
    }

    private List<Forslag> ExtractCards(string html, int limit, HashSet<string> seen)
    {
        var items = new List<Forslag>();

        foreach (Match m in RecipeCardPattern.Matches(html))
        {
            if (items.Count >= limit) break;

            var href = m.Groups[1].Value.Trim();
            var title = WebUtility.HtmlDecode(m.Groups[2].Value.Trim());
            if (string.IsNullOrWhiteSpace(href) || string.IsNullOrWhiteSpace(title)) continue;

            var url = ResolveUrl(href);
            if (!seen.Add(url)) continue;

            string? imageUrl = null;
            if (ImagePattern is not null)
            {
                // Try to find image in a window around the current match
                var start = Math.Max(0, m.Index - 200);
                var length = Math.Min(html.Length - start, m.Length + 800);
                var block = html.Substring(start, length);
                var imgMatch = ImagePattern.Match(block);
                if (imgMatch.Success)
                {
                    // Group 1 = data-src/src, Group 2 = srcset — use whichever matched
                    var g1 = imgMatch.Groups[1].Value.Trim();
                    var g2 = imgMatch.Groups[2].Value.Trim();
                    imageUrl = WebUtility.HtmlDecode(g1.Length > 0 ? g1 : g2);
                    if (imageUrl.Length == 0) imageUrl = null;
                }
            }

            items.Add(new Forslag
            {
                Title = title,
                SourceUrl = url,
                SourceSite = SourceSite,
                ImageUrl = imageUrl,
                FetchedAt = DateTimeOffset.UtcNow,
            });
        }

        return items;
    }
}

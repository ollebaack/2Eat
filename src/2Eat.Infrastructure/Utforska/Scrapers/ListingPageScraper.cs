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

        _logger.LogInformation("Scraped {Count} Förslag from {Site}", results.Count, SourceSite);
        return results;
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
                    imageUrl = WebUtility.HtmlDecode(imgMatch.Groups[1].Value.Trim());
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

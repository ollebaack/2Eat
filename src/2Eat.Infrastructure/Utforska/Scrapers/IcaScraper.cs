using Microsoft.Extensions.Logging;
using System.Text.RegularExpressions;

namespace _2Eat.Infrastructure.Utforska.Scrapers;

/// <summary>
/// Scrapes recipe listings from ica.se/recept/.
/// ICA renders SSR HTML with structured anchor elements linking to individual recipe pages.
/// </summary>
public class IcaScraper : ListingPageScraper
{
    public IcaScraper(IHttpClientFactory httpFactory, ILogger<IcaScraper> logger)
        : base(httpFactory, logger) { }

    public override string SourceSite => "ICA";

    protected override IReadOnlyList<string> ListingUrls =>
    [
        "https://www.ica.se/recept/",
        "https://www.ica.se/recept/middag/",
    ];

    // ICA renders absolute hrefs: https://www.ica.se/recept/[slug]-[id]/
    // The ID is appended to the slug (no separate path segment).
    // Group 1 = href, Group 2 = title (direct text content of the anchor)
    protected override Regex RecipeCardPattern { get; } = new(
        @"<a[^>]+href=""(https://www\.ica\.se/recept/[a-zA-Z0-9\-]+/)""[^>]*>\s*(?:<[^>]+>\s*)*([A-ZÅÄÖ][^<]{3,80})",
        RegexOptions.IgnoreCase | RegexOptions.Compiled);

    // ICA typically uses a data-src or src on <img> tags within each card
    protected override Regex? ImagePattern { get; } = new(
        @"<img[^>]+(?:data-src|src)=""(https://[^""]+\.(?:jpg|jpeg|png|webp)[^""]*)""|srcset=""(https://[^"" ]+\.(?:jpg|jpeg|png|webp)[^"" ]*)",
        RegexOptions.IgnoreCase | RegexOptions.Compiled);

    protected override string ResolveUrl(string href) =>
        href.StartsWith("http", StringComparison.OrdinalIgnoreCase)
            ? href
            : $"https://www.ica.se{href}";
}

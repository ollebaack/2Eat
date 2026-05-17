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
        "https://www.ica.se/recept/alla-recept/?pageSize=50",
        "https://www.ica.se/recept/middag/",
    ];

    // Match anchors whose href points to a recipe page: /recept/[slug]/[digits]/
    // Group 1 = href, Group 2 = title from the link text or nearby heading
    protected override Regex RecipeCardPattern { get; } = new(
        @"<a[^>]+href=""(/recept/[a-zA-Z0-9\-]+/\d+/?)""[^>]*>\s*(?:<[^>]+>\s*)*([A-ZÅÄÖ][^<]{3,80})",
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

using Microsoft.Extensions.Logging;
using System.Text.RegularExpressions;

namespace _2Eat.Infrastructure.Utforska.Scrapers;

/// <summary>
/// Scrapes recipe listings from coop.se/recept/.
/// </summary>
public class CoopScraper : ListingPageScraper
{
    public CoopScraper(IHttpClientFactory httpFactory, ILogger<CoopScraper> logger)
        : base(httpFactory, logger) { }

    public override string SourceSite => "Coop";

    protected override IReadOnlyList<string> ListingUrls =>
    [
        "https://www.coop.se/recept/",
        "https://www.coop.se/recept/middagsrecept/",
    ];

    // Coop uses paths like /recept/[category]/[slug]/
    protected override Regex RecipeCardPattern { get; } = new(
        @"<a[^>]+href=""(/recept/[a-zA-Z0-9\-/]+?)""[^>]*>(?:\s*<[^>]*>)*\s*([A-ZÅÄÖ][^<]{3,80})",
        RegexOptions.IgnoreCase | RegexOptions.Compiled);

    protected override Regex? ImagePattern { get; } = new(
        @"<img[^>]+(?:data-src|src)=""(https://[^""]+\.(?:jpg|jpeg|png|webp)[^""]*)""|srcset=""(https://[^"" ]+\.(?:jpg|jpeg|png|webp)[^"" ]*)",
        RegexOptions.IgnoreCase | RegexOptions.Compiled);

    protected override string ResolveUrl(string href) =>
        href.StartsWith("http", StringComparison.OrdinalIgnoreCase)
            ? href
            : $"https://www.coop.se{href}";
}

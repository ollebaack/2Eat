using Microsoft.Extensions.Logging;
using System.Text.RegularExpressions;

namespace _2Eat.Infrastructure.Utforska.Scrapers;

/// <summary>
/// Scrapes recipe listings from koket.se.
/// </summary>
public class KoketScraper : ListingPageScraper
{
    public KoketScraper(IHttpClientFactory httpFactory, ILogger<KoketScraper> logger)
        : base(httpFactory, logger) { }

    public override string SourceSite => "Köket";

    protected override IReadOnlyList<string> ListingUrls =>
    [
        "https://www.koket.se/recept/",
        "https://www.koket.se/middagstips/",
    ];

    // koket.se uses paths like /recept/[slug]/ or /[category]/[slug]/
    protected override Regex RecipeCardPattern { get; } = new(
        @"<a[^>]+href=""(/(?:recept|vego|kyckling|pasta|fisk|k[öo]tt|sallad|soppa|bakning)/[a-zA-Z0-9\-]+/?)""[^>]*>(?:\s*<[^>]*>)*\s*([A-ZÅÄÖ][^<]{3,80})",
        RegexOptions.IgnoreCase | RegexOptions.Compiled);

    protected override Regex? ImagePattern { get; } = new(
        @"<img[^>]+(?:data-src|src)=""(https://[^""]+\.(?:jpg|jpeg|png|webp)[^""]*)""|srcset=""(https://[^"" ]+\.(?:jpg|jpeg|png|webp)[^"" ]*)",
        RegexOptions.IgnoreCase | RegexOptions.Compiled);

    protected override string ResolveUrl(string href) =>
        href.StartsWith("http", StringComparison.OrdinalIgnoreCase)
            ? href
            : $"https://www.koket.se{href}";
}

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
        "https://www.koket.se/recept",   // no trailing slash — /recept/ returns 404
        "https://www.koket.se/",
    ];

    // koket.se now uses flat /{slug} paths (no category prefix).
    // The recipe title lives inside a heading element within the anchor, not as direct text.
    // Group 1 = relative href (e.g. /klassisk-rabarberkram), Group 2 = title from heading
    protected override Regex RecipeCardPattern { get; } = new(
        @"<a\b[^>]+href=""(/[a-z][a-z0-9\-]*)""[^>]*>(?:(?!</a>)[\s\S]){0,600}?<h[1-6][^>]*>\s*([A-ZÅÄÖ][^<]{3,80})",
        RegexOptions.IgnoreCase | RegexOptions.Compiled);

    protected override Regex? ImagePattern { get; } = new(
        @"<img[^>]+(?:data-src|src)=""(https://[^""]+\.(?:jpg|jpeg|png|webp)[^""]*)""|srcset=""(https://[^"" ]+\.(?:jpg|jpeg|png|webp)[^"" ]*)",
        RegexOptions.IgnoreCase | RegexOptions.Compiled);

    protected override string ResolveUrl(string href) =>
        href.StartsWith("http", StringComparison.OrdinalIgnoreCase)
            ? href
            : $"https://www.koket.se{href}";
}

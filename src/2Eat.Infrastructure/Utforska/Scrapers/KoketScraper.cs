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
        // Homepage excluded: contains navigation links to TV shows, chefs, etc.
    ];

    // koket.se uses flat /{slug} paths (no category prefix).
    // The title may be direct anchor text or inside a child element (span/p) — no heading tags.
    // Group 1 = relative href (e.g. /klassisk-rabarberkram), Group 2 = title text
    // [^:<] in the title prevents matching rating text like "Betyg: 3.4 av 5 (125 röster)"
    // and ensures the text is plain prose, not structured metadata.
    //
    // Non-recipe pages (chef profiles, category pages) use short single-word slugs (e.g. /kockar,
    // /johans-kok, /kott) or slugs with very few hyphens, whereas recipe slugs are descriptive
    // multi-word phrases (e.g. /klassisk-rabarberkram, /pannbiff-med-lok-och-graddsky).
    // Requiring at least two hyphens in the slug reliably excludes profile/category links while
    // keeping all recipe cards. The ingredient-count guard in ListingPageScraper is a final
    // safety net for any edge cases that slip through.
    protected override Regex RecipeCardPattern { get; } = new(
        @"<a\b[^>]+href=""(/[a-z][a-z0-9]*(?:-[a-z0-9]+){2,})""[^>]*>\s*(?:<[^>]+>\s*)*([A-ZÅÄÖ][^<:]{3,80})",
        RegexOptions.IgnoreCase | RegexOptions.Compiled);

    protected override Regex? ImagePattern { get; } = new(
        @"<img[^>]+(?:data-src|src)=""(https://[^""]+\.(?:jpg|jpeg|png|webp)[^""]*)""|srcset=""(https://[^"" ]+\.(?:jpg|jpeg|png|webp)[^"" ]*)",
        RegexOptions.IgnoreCase | RegexOptions.Compiled);

    protected override string ResolveUrl(string href) =>
        href.StartsWith("http", StringComparison.OrdinalIgnoreCase)
            ? href
            : $"https://www.koket.se{href}";
}

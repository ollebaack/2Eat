using _2Eat.Application.Utforska;
using _2Eat.Domain;
using _2Eat.Infrastructure.Utforska.Scrapers;
using Microsoft.Extensions.Logging;

namespace _2Eat.Infrastructure.Utforska;

public class ForslagScraperOrchestrator : IForslagScraperService
{
    private const int MaxPerSource = 50;

    private readonly IcaScraper _ica;
    private readonly KoketScraper _koket;
    private readonly CoopScraper _coop;
    private readonly ILogger<ForslagScraperOrchestrator> _logger;

    public ForslagScraperOrchestrator(
        IcaScraper ica,
        KoketScraper koket,
        CoopScraper coop,
        ILogger<ForslagScraperOrchestrator> logger)
    {
        _ica = ica;
        _koket = koket;
        _coop = coop;
        _logger = logger;
    }

    public async Task<Dictionary<string, List<Forslag>>> ScrapeAllAsync(CancellationToken ct = default)
    {
        // Scrape sources in parallel; failures per-source are already handled in the base scraper
        var tasks = new[]
        {
            _ica.ScrapeAsync(MaxPerSource, ct),
            _koket.ScrapeAsync(MaxPerSource, ct),
            _coop.ScrapeAsync(MaxPerSource, ct),
        };

        await Task.WhenAll(tasks);

        var result = new Dictionary<string, List<Forslag>>
        {
            [_ica.SourceSite]   = tasks[0].Result,
            [_koket.SourceSite] = tasks[1].Result,
            [_coop.SourceSite]  = tasks[2].Result,
        };

        var total = result.Values.Sum(v => v.Count);
        _logger.LogInformation("Scraping complete — {Total} Förslag across {Sources} sources", total, result.Count);

        return result;
    }
}

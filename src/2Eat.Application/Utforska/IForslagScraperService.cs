using _2Eat.Domain;

namespace _2Eat.Application.Utforska;

public interface IForslagScraperService
{
    /// <summary>
    /// Scrapes all configured sources and returns their Förslag grouped by source site.
    /// Each inner list contains up to the configured per-source limit.
    /// </summary>
    Task<Dictionary<string, List<Forslag>>> ScrapeAllAsync(CancellationToken ct = default);
}

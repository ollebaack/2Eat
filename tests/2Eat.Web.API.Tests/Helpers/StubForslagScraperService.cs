using _2Eat.Application.Utforska;
using _2Eat.Domain;

namespace _2Eat.Web.API.Tests.Helpers;

/// <summary>Returns 3 deterministic fake Förslag — no outbound HTTP in tests.</summary>
internal sealed class StubForslagScraperService : IForslagScraperService
{
    public Task<Dictionary<string, List<Forslag>>> ScrapeAllAsync(CancellationToken ct = default)
    {
        var now = DateTimeOffset.UtcNow;
        var items = Enumerable.Range(1, 3).Select(i => new Forslag
        {
            Title = $"Stubbed Recept {i}",
            SourceUrl = $"https://example.com/recept/{i}",
            ImageUrl = null,
            SourceSite = "stub",
            FetchedAt = now,
        }).ToList();

        return Task.FromResult(new Dictionary<string, List<Forslag>>
        {
            ["stub"] = items
        });
    }
}

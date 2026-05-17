using _2Eat.Domain;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace _2Eat.Application.Utforska;

public class ForslagService : IForslagService
{
    private const int PageSize = 10;

    private readonly IForslagRepository _repo;
    private readonly IForslagScraperService _scraper;
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<ForslagService> _logger;

    public ForslagService(
        IForslagRepository repo,
        IForslagScraperService scraper,
        IServiceScopeFactory scopeFactory,
        ILogger<ForslagService> logger)
    {
        _repo = repo;
        _scraper = scraper;
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    public async Task<List<Forslag>> GetNextAsync(int userId, CancellationToken ct = default)
    {
        var total = await _repo.TotalCountAsync(ct);
        var unseenCount = await _repo.GetUnseenCountAsync(userId, ct);

        // Reset cursor if user has seen everything
        if (unseenCount == 0 && total > 0)
        {
            _logger.LogInformation("User {UserId} has seen all Förslag — resetting cursor", userId);
            await _repo.ResetSeenAsync(userId, ct);
            unseenCount = total;
        }

        var items = await _repo.GetUnseenAsync(userId, PageSize, ct);
        if (items.Count > 0)
            await _repo.MarkSeenAsync(userId, items.Select(f => f.Id), ct);

        // When the user has seen ≥ half the pool, kick off a background refresh so
        // fresh content is ready before they exhaust what remains.
        // A new scope is required: this service and its DbContext are request-scoped
        // and will be disposed when the request ends — before the task completes.
        if (total > 0 && unseenCount <= total / 2)
            _ = Task.Run(async () =>
            {
                using var scope = _scopeFactory.CreateScope();
                var svc = scope.ServiceProvider.GetRequiredService<IForslagService>();
                await svc.RefreshPoolAsync();
            });

        return items;
    }

    public Task<Forslag?> GetByIdAsync(int id, CancellationToken ct = default) =>
        _repo.GetByIdAsync(id, ct);

    public async Task<(bool Refreshed, string Message)> RefreshPoolAsync(CancellationToken ct = default)
    {
        _logger.LogInformation("Starting Förslag pool refresh...");
        var bySource = await _scraper.ScrapeAllAsync(ct);

        var total = 0;
        foreach (var (site, items) in bySource)
        {
            await _repo.ReplaceBySourceAsync(site, items, ct);
            total += items.Count;
            _logger.LogInformation("Replaced {Count} Förslag from {Site}", items.Count, site);
        }

        return (true, $"Refreshed {total} Förslag from {bySource.Count} sources.");
    }
}

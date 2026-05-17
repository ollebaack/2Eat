using _2Eat.Domain;
using Microsoft.Extensions.Logging;

namespace _2Eat.Application.Utforska;

public class ForslagService : IForslagService
{
    private static readonly TimeSpan RefreshCooldown = TimeSpan.FromMinutes(30);
    private const int PageSize = 25;

    private readonly IForslagRepository _repo;
    private readonly IForslagScraperService _scraper;
    private readonly ILogger<ForslagService> _logger;

    public ForslagService(
        IForslagRepository repo,
        IForslagScraperService scraper,
        ILogger<ForslagService> logger)
    {
        _repo = repo;
        _scraper = scraper;
        _logger = logger;
    }

    public async Task<List<Forslag>> GetNextAsync(int userId, CancellationToken ct = default)
    {
        // Reset cursor if user has seen everything
        var unseenCount = await _repo.GetUnseenCountAsync(userId, ct);
        if (unseenCount == 0)
        {
            var total = await _repo.TotalCountAsync(ct);
            if (total > 0)
            {
                _logger.LogInformation("User {UserId} has seen all Förslag — resetting cursor", userId);
                await _repo.ResetSeenAsync(userId, ct);
            }
        }

        var items = await _repo.GetUnseenAsync(userId, PageSize, ct);
        if (items.Count > 0)
            await _repo.MarkSeenAsync(userId, items.Select(f => f.Id), ct);

        return items;
    }

    public Task<Forslag?> GetByIdAsync(int id, CancellationToken ct = default) =>
        _repo.GetByIdAsync(id, ct);

    public async Task<(bool Refreshed, string Message)> RefreshPoolAsync(CancellationToken ct = default)
    {
        if (await _repo.WasRefreshedRecentlyAsync(RefreshCooldown, ct))
        {
            var msg = $"Refresh blocked — pool was updated within the last {RefreshCooldown.TotalMinutes:0} minutes.";
            _logger.LogInformation(msg);
            return (false, msg);
        }

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

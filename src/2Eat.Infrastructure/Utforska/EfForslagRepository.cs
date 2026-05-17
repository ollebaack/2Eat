using _2Eat.Application.Utforska;
using _2Eat.Domain;
using Microsoft.EntityFrameworkCore;

namespace _2Eat.Infrastructure.Utforska;

public class EfForslagRepository : IForslagRepository
{
    private readonly ApplicationDbContext _db;

    public EfForslagRepository(ApplicationDbContext db) => _db = db;

    public Task<int> TotalCountAsync(CancellationToken ct = default) =>
        _db.Forslag.CountAsync(ct);

    public Task<int> GetUnseenCountAsync(int userId, CancellationToken ct = default) =>
        _db.Forslag
            .Where(f => !_db.UserForslag.Any(uf => uf.UserId == userId && uf.ForslagId == f.Id))
            .CountAsync(ct);

    public Task<List<Forslag>> GetUnseenAsync(int userId, int count, CancellationToken ct = default) =>
        _db.Forslag
            .Where(f => !_db.UserForslag.Any(uf => uf.UserId == userId && uf.ForslagId == f.Id))
            .OrderBy(_ => EF.Functions.Random())
            .Take(count)
            .ToListAsync(ct);

    public Task<List<Forslag>> GetAllUnseenAsync(int userId, CancellationToken ct = default) =>
        _db.Forslag
            .Include(f => f.IngredientNames)
            .Where(f => !_db.UserForslag.Any(uf => uf.UserId == userId && uf.ForslagId == f.Id))
            .ToListAsync(ct);

    public Task<Forslag?> GetByIdAsync(int id, CancellationToken ct = default) =>
        _db.Forslag.FirstOrDefaultAsync(f => f.Id == id, ct);

    public async Task MarkSeenAsync(int userId, IEnumerable<int> forslagIds, CancellationToken ct = default)
    {
        var now = DateTimeOffset.UtcNow;
        var rows = forslagIds.Select(fid => new UserForslag
        {
            UserId = userId,
            ForslagId = fid,
            SeenAt = now,
        });
        _db.UserForslag.AddRange(rows);
        await _db.SaveChangesAsync(ct);
    }

    public async Task ResetSeenAsync(int userId, CancellationToken ct = default)
    {
        await _db.UserForslag
            .Where(uf => uf.UserId == userId)
            .ExecuteDeleteAsync(ct);
    }

    public async Task ReplaceBySourceAsync(string sourceSite, IEnumerable<Forslag> incoming, CancellationToken ct = default)
    {
        // Delete existing Förslag for this source (UserForslag rows cascade-delete)
        await _db.Forslag
            .Where(f => f.SourceSite == sourceSite)
            .ExecuteDeleteAsync(ct);

        _db.Forslag.AddRange(incoming);
        await _db.SaveChangesAsync(ct);
    }

}

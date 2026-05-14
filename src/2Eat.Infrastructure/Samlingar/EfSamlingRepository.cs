using _2Eat.Application.Samlingar;
using _2Eat.Domain;
using Microsoft.EntityFrameworkCore;

namespace _2Eat.Infrastructure.Samlingar;

public class EfSamlingRepository(ApplicationDbContext db) : ISamlingRepository
{
    public async Task<List<Samling>> GetByUserAsync(int userId) =>
        await db.Samlingar
            .Where(s => s.UserId == userId)
            .Include(s => s.Recept.OrderBy(sr => sr.Order))
                .ThenInclude(sr => sr.Recipe)
            .OrderBy(s => s.CreatedAt)
            .ToListAsync();

    public async Task<Samling?> GetByIdAsync(int samlingId, int userId) =>
        await db.Samlingar
            .Where(s => s.Id == samlingId && s.UserId == userId)
            .Include(s => s.Recept.OrderBy(sr => sr.Order))
                .ThenInclude(sr => sr.Recipe)
            .FirstOrDefaultAsync();

    public async Task<Samling> AddAsync(Samling samling)
    {
        db.Samlingar.Add(samling);
        await db.SaveChangesAsync();
        return samling;
    }

    public async Task RemoveAsync(Samling samling)
    {
        db.Samlingar.Remove(samling);
        await db.SaveChangesAsync();
    }

    public Task<SamlingRecept?> FindReceptAsync(int samlingId, int receptId) =>
        db.SamlingarRecept
            .FirstOrDefaultAsync(sr => sr.SamlingId == samlingId && sr.ReceptId == receptId);

    public async Task AddReceptAsync(SamlingRecept samlingRecept)
    {
        db.SamlingarRecept.Add(samlingRecept);
        await db.SaveChangesAsync();
    }

    public async Task RemoveReceptAsync(SamlingRecept samlingRecept)
    {
        db.SamlingarRecept.Remove(samlingRecept);
        await db.SaveChangesAsync();
    }

    public async Task<int> GetMaxOrderAsync(int samlingId) =>
        await db.SamlingarRecept
            .Where(sr => sr.SamlingId == samlingId)
            .MaxAsync(sr => (int?)sr.Order) ?? 0;

    public async Task UpdateOrdersAsync(int samlingId, List<int> orderedReceptIds)
    {
        for (var i = 0; i < orderedReceptIds.Count; i++)
        {
            var sr = await db.SamlingarRecept
                .FirstOrDefaultAsync(x => x.SamlingId == samlingId && x.ReceptId == orderedReceptIds[i]);
            if (sr is not null)
                sr.Order = i;
        }
        await db.SaveChangesAsync();
    }

    public async Task<List<int>> GetUserSamlingIdsForReceptAsync(int receptId, int userId) =>
        await db.SamlingarRecept
            .Where(sr => sr.ReceptId == receptId && sr.Samling.UserId == userId)
            .Select(sr => sr.SamlingId)
            .ToListAsync();

    public Task SaveAsync() => db.SaveChangesAsync();
}

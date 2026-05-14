using _2Eat.Domain;

namespace _2Eat.Application.Samlingar;

public class SamlingService(ISamlingRepository repository) : ISamlingService
{
    public Task<List<Samling>> GetAllAsync(int userId) =>
        repository.GetByUserAsync(userId);

    public Task<Samling?> GetByIdAsync(int samlingId, int userId) =>
        repository.GetByIdAsync(samlingId, userId);

    public async Task<Samling> CreateAsync(int userId, string name)
    {
        var samling = new Samling { UserId = userId, Name = name };
        return await repository.AddAsync(samling);
    }

    public async Task<Samling?> RenameAsync(int samlingId, int userId, string name)
    {
        var samling = await repository.GetByIdAsync(samlingId, userId);
        if (samling is null) return null;
        samling.Name = name;
        await repository.SaveAsync();
        return samling;
    }

    public async Task DeleteAsync(int samlingId, int userId)
    {
        var samling = await repository.GetByIdAsync(samlingId, userId);
        if (samling is not null)
            await repository.RemoveAsync(samling);
    }

    public async Task AddReceptAsync(int samlingId, int receptId, int userId)
    {
        _ = await repository.GetByIdAsync(samlingId, userId)
            ?? throw new KeyNotFoundException($"Samling {samlingId} not found");
        var existing = await repository.FindReceptAsync(samlingId, receptId);
        if (existing is not null) return;
        var order = await repository.GetMaxOrderAsync(samlingId);
        await repository.AddReceptAsync(new SamlingRecept { SamlingId = samlingId, ReceptId = receptId, Order = order + 1 });
    }

    public async Task RemoveReceptAsync(int samlingId, int receptId, int userId)
    {
        _ = await repository.GetByIdAsync(samlingId, userId)
            ?? throw new KeyNotFoundException($"Samling {samlingId} not found");
        var item = await repository.FindReceptAsync(samlingId, receptId);
        if (item is not null)
            await repository.RemoveReceptAsync(item);
    }

    public async Task UpdateOrderAsync(int samlingId, int userId, List<int> orderedReceptIds)
    {
        _ = await repository.GetByIdAsync(samlingId, userId)
            ?? throw new KeyNotFoundException($"Samling {samlingId} not found");
        await repository.UpdateOrdersAsync(samlingId, orderedReceptIds);
    }

    public Task<List<int>> GetSamlingarForReceptAsync(int receptId, int userId) =>
        repository.GetUserSamlingIdsForReceptAsync(receptId, userId);

    public async Task SyncReceptMembershipAsync(int receptId, int userId, List<int> samlingIds)
    {
        var current = await repository.GetUserSamlingIdsForReceptAsync(receptId, userId);
        var toAdd = samlingIds.Except(current).ToList();
        var toRemove = current.Except(samlingIds).ToList();

        foreach (var sid in toAdd)
        {
            var existing = await repository.FindReceptAsync(sid, receptId);
            if (existing is null)
            {
                var order = await repository.GetMaxOrderAsync(sid);
                await repository.AddReceptAsync(new SamlingRecept { SamlingId = sid, ReceptId = receptId, Order = order + 1 });
            }
        }
        foreach (var sid in toRemove)
        {
            var item = await repository.FindReceptAsync(sid, receptId);
            if (item is not null)
                await repository.RemoveReceptAsync(item);
        }
    }
}

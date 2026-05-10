using _2Eat.Domain;

namespace _2Eat.Application.Pantry;

public class PantryItemService(IPantryRepository repository) : IPantryItemService
{
    public Task<List<PantryItem>> GetAllAsync(int userId) =>
        repository.GetByUserAsync(userId);

    public async Task<PantryItem> CreateAsync(int userId, PantryItem item)
    {
        item.UserId = userId;
        var added = await repository.AddAsync(item);
        await repository.SaveAsync();
        return added;
    }

    public async Task<PantryItem> UpdateAsync(int userId, int id, PantryItem item)
    {
        var existing = await repository.FindAsync(id, userId)
            ?? throw new KeyNotFoundException($"PantryItem {id} not found");
        existing.Name = item.Name;
        existing.Category = item.Category;
        existing.Quantity = item.Quantity;
        existing.Unit = item.Unit;
        existing.ExpiresAt = item.ExpiresAt;
        existing.IsOpened = item.IsOpened;
        existing.IsLow = item.IsLow;
        await repository.SaveAsync();
        return existing;
    }

    public async Task DeleteAsync(int userId, int id)
    {
        var item = await repository.FindAsync(id, userId);
        if (item != null)
        {
            await repository.RemoveAsync(item);
            await repository.SaveAsync();
        }
    }
}

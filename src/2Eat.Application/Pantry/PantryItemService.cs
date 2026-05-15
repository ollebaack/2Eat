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

    private static readonly IReadOnlyList<PantryItem> StarterItems =
    [
        new() { Name = "Mjölk",       Category = "Mejeri",    Quantity = 1, Unit = "l" },
        new() { Name = "Smör",        Category = "Mejeri",    Quantity = 1, Unit = "st" },
        new() { Name = "Ägg",         Category = "Kyl",       Quantity = 6, Unit = "st" },
        new() { Name = "Vetemjöl",    Category = "Skafferi",  Quantity = 1, Unit = "kg" },
        new() { Name = "Strösocker",  Category = "Skafferi",  Quantity = 1, Unit = "kg" },
        new() { Name = "Salt",        Category = "Krydda",    Quantity = 1, Unit = "st" },
        new() { Name = "Svartpeppar", Category = "Krydda",    Quantity = 1, Unit = "st" },
        new() { Name = "Rapsolja",    Category = "Krydda",    Quantity = 1, Unit = "l" },
        new() { Name = "Ris",         Category = "Skafferi",  Quantity = 1, Unit = "kg" },
        new() { Name = "Pasta",       Category = "Skafferi",  Quantity = 1, Unit = "kg" },
        new() { Name = "Ketchup",     Category = "Krydda",    Quantity = 1, Unit = "st" },
        new() { Name = "Senap",       Category = "Krydda",    Quantity = 1, Unit = "st" },
        new() { Name = "Soja",        Category = "Krydda",    Quantity = 1, Unit = "st" },
        new() { Name = "Lök",         Category = "Grönsaker", Quantity = 2, Unit = "st" },
        new() { Name = "Vitlök",      Category = "Grönsaker", Quantity = 1, Unit = "st" },
    ];

    public async Task<List<PantryItem>> SeedStarterItemsAsync(int userId)
    {
        var added = new List<PantryItem>();
        foreach (var template in StarterItems)
        {
            var item = new PantryItem
            {
                UserId = userId,
                Name = template.Name,
                Category = template.Category,
                Quantity = template.Quantity,
                Unit = template.Unit,
            };
            added.Add(await repository.AddAsync(item));
        }
        await repository.SaveAsync();
        return added;
    }
}

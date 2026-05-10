using _2Eat.Application.Pantry;
using _2Eat.Domain;
using Microsoft.EntityFrameworkCore;

namespace _2Eat.Infrastructure.Pantry;

public class EfPantryRepository(ApplicationDbContext db) : IPantryRepository
{
    public Task<List<PantryItem>> GetByUserAsync(int userId) =>
        db.PantryItems
            .Where(i => i.UserId == userId)
            .OrderBy(i => i.Category)
            .ThenBy(i => i.Name)
            .ToListAsync();

    public Task<PantryItem> AddAsync(PantryItem item)
    {
        db.PantryItems.Add(item);
        return Task.FromResult(item);
    }

    public Task<PantryItem?> FindAsync(int id, int userId) =>
        db.PantryItems.FirstOrDefaultAsync(i => i.Id == id && i.UserId == userId);

    public Task SaveAsync() => db.SaveChangesAsync();

    public Task RemoveAsync(PantryItem item)
    {
        db.PantryItems.Remove(item);
        return Task.CompletedTask;
    }
}

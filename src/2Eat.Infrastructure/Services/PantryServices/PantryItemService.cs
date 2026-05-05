using _2Eat.Domain;
using Microsoft.EntityFrameworkCore;

namespace _2Eat.Infrastructure.Services.PantryServices
{
    public class PantryItemService(ApplicationDbContext db) : IPantryItemService
    {
        public Task<List<PantryItem>> GetAllAsync() =>
            db.PantryItems.OrderBy(i => i.Category).ThenBy(i => i.Name).ToListAsync();

        public async Task<PantryItem> CreateAsync(PantryItem item)
        {
            db.PantryItems.Add(item);
            await db.SaveChangesAsync();
            return item;
        }

        public async Task<PantryItem> UpdateAsync(int id, PantryItem item)
        {
            var existing = await db.PantryItems.FindAsync(id)
                ?? throw new KeyNotFoundException($"PantryItem {id} not found");
            existing.Name = item.Name;
            existing.Category = item.Category;
            existing.Quantity = item.Quantity;
            existing.Unit = item.Unit;
            existing.ExpiresAt = item.ExpiresAt;
            existing.IsOpened = item.IsOpened;
            existing.IsLow = item.IsLow;
            await db.SaveChangesAsync();
            return existing;
        }

        public async Task DeleteAsync(int id)
        {
            var item = await db.PantryItems.FindAsync(id);
            if (item != null)
            {
                db.PantryItems.Remove(item);
                await db.SaveChangesAsync();
            }
        }
    }
}

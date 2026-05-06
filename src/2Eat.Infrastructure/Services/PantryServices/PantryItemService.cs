using _2Eat.Domain;
using Microsoft.EntityFrameworkCore;

namespace _2Eat.Infrastructure.Services.PantryServices
{
    public class PantryItemService(ApplicationDbContext db) : IPantryItemService
    {
        public Task<List<PantryItem>> GetAllAsync(int userId) =>
            db.PantryItems.Where(i => i.UserId == userId).OrderBy(i => i.Category).ThenBy(i => i.Name).ToListAsync();

        public async Task<PantryItem> CreateAsync(int userId, PantryItem item)
        {
            item.UserId = userId;
            db.PantryItems.Add(item);
            await db.SaveChangesAsync();
            return item;
        }

        public async Task<PantryItem> UpdateAsync(int userId, int id, PantryItem item)
        {
            var existing = await db.PantryItems.FirstOrDefaultAsync(i => i.Id == id && i.UserId == userId)
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

        public async Task DeleteAsync(int userId, int id)
        {
            var item = await db.PantryItems.FirstOrDefaultAsync(i => i.Id == id && i.UserId == userId);
            if (item != null)
            {
                db.PantryItems.Remove(item);
                await db.SaveChangesAsync();
            }
        }
    }
}

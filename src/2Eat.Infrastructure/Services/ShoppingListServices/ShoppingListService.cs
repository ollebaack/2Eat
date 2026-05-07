using _2Eat.Domain;
using Microsoft.EntityFrameworkCore;

namespace _2Eat.Infrastructure.Services.ShoppingListServices
{
    public class ShoppingListService(ApplicationDbContext db) : IShoppingListService
    {
        private static string FormatItemName(string name, double? quantity, string? unit) =>
            quantity.HasValue && !string.IsNullOrWhiteSpace(unit)
                ? $"{quantity} {unit} {name}"
                : quantity.HasValue
                    ? $"{quantity} {name}"
                    : name;

        private async Task<ShoppingList> GetOrCreateListAsync(int userId)
        {
            var user = await db.Users
                .Include(u => u.ShoppingList)
                .FirstOrDefaultAsync(u => u.Id == userId)
                ?? throw new KeyNotFoundException($"User {userId} not found");

            if (user.ShoppingList == null)
            {
                var list = new ShoppingList { Name = "Handlista", UserId = userId };
                db.ShoppingLists.Add(list);
                user.ShoppingList = list;
                await db.SaveChangesAsync();
            }

            return user.ShoppingList;
        }

        public async Task<List<ShoppingListItem>> GetItemsAsync(int userId)
        {
            var list = await GetOrCreateListAsync(userId);
            return await db.ShoppingListItems
                .Where(i => i.ShoppingListId == list.Id)
                .OrderBy(i => i.Id)
                .ToListAsync();
        }

        public async Task<ShoppingListItem> AddItemAsync(int userId, string name, double? quantity, string? unit)
        {
            var list = await GetOrCreateListAsync(userId);
            var item = new ShoppingListItem
            {
                Name = FormatItemName(name, quantity, unit),
                ShoppingListId = list.Id,
                IsChecked = false,
            };
            db.ShoppingListItems.Add(item);
            await db.SaveChangesAsync();
            return item;
        }

        public async Task<ShoppingListItem> UpdateItemAsync(int id, int userId, bool isChecked)
        {
            var list = await GetOrCreateListAsync(userId);
            var item = await db.ShoppingListItems
                .FirstOrDefaultAsync(i => i.Id == id && i.ShoppingListId == list.Id)
                ?? throw new KeyNotFoundException($"ShoppingListItem {id} not found");

            item.IsChecked = isChecked;
            await db.SaveChangesAsync();
            return item;
        }

        public async Task DeleteItemAsync(int id, int userId)
        {
            var list = await GetOrCreateListAsync(userId);
            var item = await db.ShoppingListItems
                .FirstOrDefaultAsync(i => i.Id == id && i.ShoppingListId == list.Id);
            if (item != null)
            {
                db.ShoppingListItems.Remove(item);
                await db.SaveChangesAsync();
            }
        }

        public async Task AddRecipeIngredientsAsync(int recipeId, int userId)
        {
            var recipe = await db.Recipes
                .Include(r => r.Ingredients)
                    .ThenInclude(ri => ri.Ingredient)
                .Include(r => r.Ingredients)
                    .ThenInclude(ri => ri.IngredientMeasurement)
                .FirstOrDefaultAsync(r => r.Id == recipeId)
                ?? throw new KeyNotFoundException($"Recipe {recipeId} not found");

            var list = await GetOrCreateListAsync(userId);

            foreach (var ri in recipe.Ingredients)
            {
                db.ShoppingListItems.Add(new ShoppingListItem
                {
                    Name = ri.ToString(),
                    ShoppingListId = list.Id,
                    IsChecked = false,
                });
            }

            await db.SaveChangesAsync();
        }
    }
}

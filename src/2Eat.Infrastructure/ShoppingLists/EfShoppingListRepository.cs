using _2Eat.Application.ShoppingLists;
using _2Eat.Domain;
using Microsoft.EntityFrameworkCore;

namespace _2Eat.Infrastructure.ShoppingLists;

public class EfShoppingListRepository(ApplicationDbContext db) : IShoppingListRepository
{
    public async Task<ShoppingList> GetOrCreateListAsync(int userId)
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

    public async Task<List<ShoppingListItem>> GetItemsAsync(int listId) =>
        await db.ShoppingListItems
            .Where(i => i.ShoppingListId == listId)
            .OrderBy(i => i.Id)
            .ToListAsync();

    public async Task<ShoppingListItem> AddItemAsync(ShoppingListItem item)
    {
        db.ShoppingListItems.Add(item);
        await db.SaveChangesAsync();
        return item;
    }

    public async Task<ShoppingListItem?> FindItemAsync(int itemId, int listId) =>
        await db.ShoppingListItems
            .FirstOrDefaultAsync(i => i.Id == itemId && i.ShoppingListId == listId);

    public async Task RemoveItemAsync(ShoppingListItem item)
    {
        db.ShoppingListItems.Remove(item);
        await db.SaveChangesAsync();
    }

    public async Task<(List<RecipeIngredient> Ingredients, bool Found)> GetRecipeIngredientsAsync(int recipeId)
    {
        var recipe = await db.Recipes
            .Include(r => r.Ingredients)
                .ThenInclude(ri => ri.Ingredient)
            .Include(r => r.Ingredients)
                .ThenInclude(ri => ri.IngredientMeasurement)
            .FirstOrDefaultAsync(r => r.Id == recipeId);

        return recipe is null
            ? ([], false)
            : (recipe.Ingredients.ToList(), true);
    }

    public async Task AddItemsAsync(IEnumerable<ShoppingListItem> items)
    {
        db.ShoppingListItems.AddRange(items);
        await db.SaveChangesAsync();
    }

    public async Task SaveAsync() => await db.SaveChangesAsync();
}

using _2Eat.Domain;

namespace _2Eat.Application.ShoppingLists;

public interface IShoppingListRepository
{
    Task<ShoppingList> GetOrCreateListAsync(int userId);
    Task<List<ShoppingListItem>> GetItemsAsync(int listId);
    Task<ShoppingListItem> AddItemAsync(ShoppingListItem item);
    Task<ShoppingListItem?> FindItemAsync(int itemId, int listId);
    Task RemoveItemAsync(ShoppingListItem item);
    Task<(List<RecipeIngredient> Ingredients, bool Found)> GetRecipeIngredientsAsync(int recipeId);
    Task AddItemsAsync(IEnumerable<ShoppingListItem> items);
    Task SaveAsync();
}

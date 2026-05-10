using _2Eat.Domain;

namespace _2Eat.Application.ShoppingLists;

public interface IShoppingListService
{
    Task<List<ShoppingListItem>> GetItemsAsync(int userId);
    Task<ShoppingListItem> AddItemAsync(int userId, string name, double? quantity, string? unit);
    Task<ShoppingListItem> UpdateItemAsync(int id, int userId, bool isChecked);
    Task DeleteItemAsync(int id, int userId);
    Task AddRecipeIngredientsAsync(int recipeId, int userId);
}

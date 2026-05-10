using _2Eat.Domain;

namespace _2Eat.Application.ShoppingLists;

public class ShoppingListService(IShoppingListRepository repository) : IShoppingListService
{
    private static string FormatItemName(string name, double? quantity, string? unit) =>
        quantity.HasValue && !string.IsNullOrWhiteSpace(unit)
            ? $"{quantity} {unit} {name}"
            : quantity.HasValue
                ? $"{quantity} {name}"
                : name;

    public async Task<List<ShoppingListItem>> GetItemsAsync(int userId)
    {
        var list = await repository.GetOrCreateListAsync(userId);
        return await repository.GetItemsAsync(list.Id);
    }

    public async Task<ShoppingListItem> AddItemAsync(int userId, string name, double? quantity, string? unit)
    {
        var list = await repository.GetOrCreateListAsync(userId);
        var item = new ShoppingListItem
        {
            Name = FormatItemName(name, quantity, unit),
            ShoppingListId = list.Id,
            IsChecked = false,
        };
        return await repository.AddItemAsync(item);
    }

    public async Task<ShoppingListItem> UpdateItemAsync(int id, int userId, bool isChecked)
    {
        var list = await repository.GetOrCreateListAsync(userId);
        var item = await repository.FindItemAsync(id, list.Id)
            ?? throw new KeyNotFoundException($"ShoppingListItem {id} not found");

        item.IsChecked = isChecked;
        await repository.SaveAsync();
        return item;
    }

    public async Task DeleteItemAsync(int id, int userId)
    {
        var list = await repository.GetOrCreateListAsync(userId);
        var item = await repository.FindItemAsync(id, list.Id);
        if (item != null)
            await repository.RemoveItemAsync(item);
    }

    public async Task AddRecipeIngredientsAsync(int recipeId, int userId)
    {
        var (ingredients, found) = await repository.GetRecipeIngredientsAsync(recipeId);
        if (!found)
            throw new KeyNotFoundException($"Recipe {recipeId} not found");

        var list = await repository.GetOrCreateListAsync(userId);
        var items = ingredients.Select(ri => new ShoppingListItem
        {
            Name = ri.ToString(),
            ShoppingListId = list.Id,
            IsChecked = false,
        });
        await repository.AddItemsAsync(items);
    }
}

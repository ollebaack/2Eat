using _2Eat.Domain;

namespace _2Eat.Application.Ingredients;

public interface IIngredientService
{
    Task<List<Ingredient>> GetIngredientsAsync();
    Task<Ingredient?> GetIngredientByIdAsync(int id);
    Task<Ingredient> AddIngredientAsync(Ingredient ingredient);
    Task<Ingredient?> UpdateIngredientAsync(int id, string name, int categoryId);
    Task<Ingredient> DeleteIngredientAsync(int id);
}

using _2Eat.Domain;

namespace _2Eat.Application.Recipes;

public interface IRecipeRepository
{
    Task<List<Recipe>> GetAllAsync();
    Task<List<Recipe>> GetRandomAsync(int count);
    Task<Recipe?> GetByIdAsync(int id);
    Task<Recipe?> GetWithIngredientsAsync(int id);
    Task<Ingredient?> FindIngredientByNameAsync(string name);
    Task<Ingredient> AddIngredientAsync(Ingredient ingredient);
    Task<Recipe> AddAsync(Recipe recipe);
    Task<Recipe> UpdateAsync(Recipe recipe);
    Task<Recipe> RemoveAsync(Recipe recipe);
    Task SaveAsync();
}

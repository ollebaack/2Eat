using _2Eat.Domain;

namespace _2Eat.Application.Recipes;

public interface IRecipeService
{
    Task<List<Recipe>> GetRecipesAsync();
    Task<List<Recipe>> GetRandomRecipesAsync(int count);
    Task<Recipe?> GetRecipeByIdAsync(int id);
    Task<Recipe> AddRecipeAsync(Recipe recipe);
    Task<Recipe> UpdateRecipeAsync(int Id, Recipe recipe);
    Task<Recipe> DeleteRecipeAsync(int id);
    Task<List<Category>> GetCategoriesAsync();
}

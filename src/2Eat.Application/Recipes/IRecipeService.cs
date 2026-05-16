using _2Eat.Application;
using _2Eat.Domain;

namespace _2Eat.Application.Recipes;

public interface IRecipeService
{
    Task<List<Recipe>> GetRecipesAsync(int userId);
    Task<PagedResult<Recipe>> GetRecipesPageAsync(RecipeQuery query);
    Task<List<Recipe>> GetRandomRecipesAsync(int count, int userId);
    Task<Recipe?> GetRecipeByIdAsync(int id, int userId);
    Task<Recipe> AddRecipeAsync(Recipe recipe, int userId);
    Task<Recipe> UpdateRecipeAsync(int id, Recipe recipe, int userId);
    Task<Recipe> DeleteRecipeAsync(int id, int userId);
    Task<List<Category>> GetCategoriesAsync();
}

using _2Eat.Application;
using _2Eat.Domain;
using _2Eat.Domain.Enums;

namespace _2Eat.Application.Recipes;

public interface IRecipeRepository
{
    Task<List<Recipe>> GetAllAsync();
    Task<PagedResult<Recipe>> GetPageAsync(RecipeQuery query);
    Task<List<Recipe>> GetRandomAsync(int count);
    Task<Recipe?> GetByIdAsync(int id);
    Task<Recipe?> GetWithIngredientsAsync(int id);
    Task<Ingredient?> FindIngredientByNameAsync(string name);
    Task<List<Allergen>> FindAllergensByIdsAsync(IEnumerable<AllergenEnum> ids);
    Task<Ingredient> AddIngredientAsync(Ingredient ingredient);
    Task<Recipe> AddAsync(Recipe recipe);
    Task<Recipe> UpdateAsync(Recipe recipe);
    Task<Recipe> RemoveAsync(Recipe recipe);
    Task SaveAsync();
    Task<List<Category>> GetCategoriesAsync();
    Task<Category?> FindCategoryByNameAsync(string name);
}

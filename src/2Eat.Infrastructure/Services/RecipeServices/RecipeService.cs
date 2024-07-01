using _2Eat.Domain;
using Microsoft.EntityFrameworkCore;

namespace _2Eat.Infrastructure.Services.RecipeServices
{
    public class RecipeService(ApplicationDbContext context) : IRecipeService
    {
        private readonly ApplicationDbContext _context = context;

        public async Task<List<Recipe>> GetRecipesAsync()
        {
            await Task.Delay(1000);

            var receipies = await _context.Recipes.ToListAsync();

            return receipies;
        }
        public async Task<Recipe?> GetRecipeByIdAsync(int id) 
            => await _context.Recipes.FindAsync(id);

        public async Task<Recipe> AddRecipeAsync(Recipe recipe)
        {
            if (string.IsNullOrEmpty(recipe.Name))
            {
                throw new ArgumentException("Recipe name is required", nameof(recipe));
            }

            var addedRecipe = await _context.Recipes.AddAsync(recipe);
            await _context.SaveChangesAsync();
            return addedRecipe.Entity;
        }

        public async Task<Recipe> UpdateRecipeAsync(int Id, Recipe recipe)
        {
            var recipeEntity = await _context.Recipes.FindAsync(Id) ?? throw new Exception("Recipe not found");

            recipeEntity.Name = recipe.Name;
            recipeEntity.Ingredients = recipe.Ingredients;
            recipeEntity.Instructions = recipe.Instructions;

            await _context.SaveChangesAsync();

            return recipeEntity;
        }

        public async Task<Recipe> DeleteRecipeAsync(int id)
        {
            var recipe = await _context.Recipes.FindAsync(id) ?? throw new Exception("Recipe not found");

            _context.Recipes.Remove(recipe);

            await _context.SaveChangesAsync();

            return recipe;
        }
    }
}

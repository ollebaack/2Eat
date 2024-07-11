using _2Eat.Domain;
using Microsoft.EntityFrameworkCore;

namespace _2Eat.Infrastructure.Services.RecipeServices
{
    public class RecipeService : IRecipeService
    {
        private readonly ApplicationDbContext _context;

        public RecipeService(ApplicationDbContext context)
        {
            _context = context;
            _context.Database.EnsureCreated();
        }

        public async Task<List<Recipe>> GetRecipesAsync()
        {
            var receipies = await _context.Recipes.ToListAsync();

            return receipies;
        }
        public async Task<Recipe?> GetRecipeByIdAsync(int id) 
            => await _context.Recipes
                .Include(x => x.Ingredients)
                    .ThenInclude(x => x.Ingredient)
                .Include(x => x.Ingredients)
                    .ThenInclude(x => x.IngredientMeasurement)
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.Id == id);

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
            var recipeEntity = await _context.Recipes
                .Include(x => x.Ingredients)
                    .ThenInclude(x => x.Ingredient)
                .Include(x => x.Ingredients)
                    .ThenInclude(x => x.IngredientMeasurement)
                .FirstOrDefaultAsync(x => x.Id == Id) ?? throw new Exception("Recipe not found");

            recipeEntity.Name = recipe.Name;
            recipeEntity.Instructions = recipe.Instructions;

            // Update and add new ingredients
            foreach (var recipeIngredient in recipe.Ingredients)
            {
                Ingredient addedIngredient;
                if (_context.Ingredients.Any(i => i.Name == recipeIngredient.Ingredient.Name))
                {
                    addedIngredient = _context.Ingredients.First(i => i.Name == recipeIngredient.Ingredient.Name);
                }
                else
                {
                    var addedIngredientTemp = await _context.Ingredients.AddAsync(recipeIngredient.Ingredient);
                    addedIngredient = addedIngredientTemp.Entity;
                }

                var existingRecipeIngredient = recipeEntity.Ingredients
                    .FirstOrDefault(ri => ri.IngredientId == addedIngredient.Id);

                if (existingRecipeIngredient != null)
                {
                    // Update the order of the existing ingredient
                    existingRecipeIngredient.Order = recipeIngredient.Order;
                }
                else
                {
                    // Add new ingredient with the correct order
                    var newRecipeIngredient = new RecipeIngredient
                    {
                        RecipeId = recipeEntity.Id,
                        IngredientId = addedIngredient.Id,
                        Order = recipeIngredient.Order,
                        IngredientMeasurement = recipeIngredient.IngredientMeasurement
                    };

                    recipeEntity.Ingredients.Add(newRecipeIngredient);
                }
            }

            // Remove ingredients that are not in the updated recipe
            //recipeEntity.Ingredients = recipeEntity.Ingredients
            //    .Where(ri => recipe.Ingredients.Any(i => i.Ingredient.Name == ri?.Ingredient?.Name))
            //    .ToList();

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

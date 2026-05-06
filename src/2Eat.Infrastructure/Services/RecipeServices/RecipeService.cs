using _2Eat.Application.Errors;
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
            return await _context.Recipes
                .Include(x => x.Category)
                .Include(x => x.Ingredients)
                    .ThenInclude(x => x.Ingredient)
                .Include(x => x.Ingredients)
                    .ThenInclude(x => x.IngredientMeasurement)
                .AsNoTracking()
                .ToListAsync();
        }
        public async Task<List<Recipe>> GetRandomRecipesAsync(int count)
            => await _context.Recipes
                .Include(x => x.Category)
                .AsNoTracking()
                .OrderBy(r => Guid.NewGuid())
                .Take(count)
                .ToListAsync();
        public async Task<Recipe?> GetRecipeByIdAsync(int id)
            => await _context.Recipes
                .Include(x => x.Category)
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

            if (recipe.CategoryId == 0)
                recipe.CategoryId = 5;

            foreach (var ri in recipe.Ingredients)
            {
                if (ri.Ingredient == null) continue;
                var existing = _context.Ingredients.FirstOrDefault(i => i.Name == ri.Ingredient.Name);
                if (existing != null)
                {
                    ri.Ingredient = existing;
                    ri.IngredientId = existing.Id;
                }
                else if (ri.Ingredient.CategoryId == 0)
                {
                    ri.Ingredient.CategoryId = 5;
                }
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
            recipeEntity.Description = recipe.Description;
            recipeEntity.Instructions = recipe.Instructions;
            recipeEntity.ImageUrl = recipe.ImageUrl;
            recipeEntity.LastModified = DateTimeOffset.Now;

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
                    if (recipeIngredient.Ingredient.CategoryId == 0)
                        recipeIngredient.Ingredient.CategoryId = 5;
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

        public async Task<Recipe> ToggleFavoriteAsync(int id)
        {
            var recipe = await _context.Recipes.FindAsync(id) ?? throw new RecipeNotFoundException(id);
            recipe.IsFavorite = !recipe.IsFavorite;
            await _context.SaveChangesAsync();
            return recipe;
        }
    }
}

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
            await Task.Delay(1000);

            var receipies = await _context.Recipes.ToListAsync();

            return receipies;
        }
        public async Task<Recipe?> GetRecipeByIdAsync(int id) 
            => await _context.Recipes
                .Include(x => x.Ingredients)
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
            var recipeEntity = await _context.Recipes.Include(x => x.Ingredients).FirstOrDefaultAsync(x => x.Id == Id) ?? throw new Exception("Recipe not found");

            recipeEntity.Name = recipe.Name;
            recipeEntity.Instructions = recipe.Instructions;

            foreach (var ingredient in recipe.Ingredients)
            {
                Ingredient? addedIngredient = null;
                if (string.IsNullOrEmpty(ingredient.Name))
                {
                    throw new ArgumentException("Ingredient name is required", nameof(ingredient));
                }
                if (_context.Ingredients.Any(i => i.Name == ingredient.Name))
                {
                    addedIngredient = _context.Ingredients.First(i => i.Name == ingredient.Name);
                }
                else
                {
                    var addedIngredientTemp = await _context.Ingredients.AddAsync(ingredient);
                    addedIngredient = addedIngredientTemp.Entity;
                }

                var entityIngredient = addedIngredient;//await _ingredientService.AddIngredientAsync(ingredient);
                if (!recipeEntity.Ingredients.Contains(entityIngredient))
                {
                    recipeEntity.Ingredients.Add(entityIngredient);
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
    }
}

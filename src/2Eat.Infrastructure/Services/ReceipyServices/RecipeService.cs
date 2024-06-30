using _2Eat.Domain;

namespace _2Eat.Infrastructure.Services.RecipeServices
{
    public class RecipeService(ApplicationDbContext context) : IRecipeService
    {
        private readonly ApplicationDbContext _context = context;

        public async Task<List<Recipe>> GetRecipesAsync()
        {
            await Task.Delay(1000);

            var testRecipes = new List<Recipe>
            {
                new() { Id = 1, Name = "Test Recipe1", Ingredients = [new Ingredient() { Name = "Flower"}, new Ingredient() { Name = "Sugar"}], Instructions = "Test Instructions"},
                new() { Id = 2, Name = "Test Recipe2", Ingredients = [new Ingredient() { Name = "Flower"}, new Ingredient() { Name = "Sugar"}], Instructions = "Test Instructions"},
                new() { Id = 3, Name = "Test Recipe3", Ingredients = [new Ingredient() { Name = "Flower"}, new Ingredient() { Name = "Sugar"}], Instructions = "Test Instructions"},
                new() { Id = 4, Name = "Test Recipe4", Ingredients = [new Ingredient() { Name = "Flower"}, new Ingredient() { Name = "Sugar"}], Instructions = "Test Instructions"},
            };
            //var receipies = await _context.Receipies.ToListAsync();
            var receipies = testRecipes;


            return receipies;
        }
        public Task<Recipe> GetRecipeByIdAsync(int id)
        {
            throw new NotImplementedException();
        }


        public Task<Domain.Recipe> AddRecipeAsync(Recipe recipe)
        {
            var recipeEntity = new Recipe
            {
                Name = recipe.Name,
                Ingredients = recipe.Ingredients,
                Instructions = recipe.Instructions
            };
            return Task.FromResult(recipeEntity);
        }

        public Task<Recipe> UpdateRecipeAsync(int Id, Recipe recipe)
        {
            var recipeEntity = new Recipe
            {
                Id = Id,
                Name = recipe.Name,
                Ingredients = recipe.Ingredients,
                Instructions = recipe.Instructions
            };
            //var updatedEntity = _context.Receipies.Update(receipyEntity);

            return Task.FromResult(recipeEntity);
        }

        public Task<Recipe> DeleteRecipeAsync(int id)
        {
            throw new NotImplementedException();
        }
    }
}

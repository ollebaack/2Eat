using _2Eat.Domain;
using Microsoft.EntityFrameworkCore;

namespace _2Eat.Infrastructure.Services.IngredientServices
{
    public class IngredientService(ApplicationDbContext context) : IIngredientService
    {
        private readonly ApplicationDbContext _context = context;

        public async Task<List<Ingredient>> GetIngredientsAsync()
        {
            await Task.Delay(1000);

            var ingredients = await _context.Ingredients.ToListAsync();

            return ingredients;
        }

        public async Task<Ingredient?> GetIngredientByIdAsync(int id) 
            => await _context.Ingredients.FindAsync(id);

        public async Task<Ingredient> AddIngredientAsync(Ingredient ingredient)
        {
            if (string.IsNullOrEmpty(ingredient.Name))
            {
                throw new ArgumentException("Recipe name is required", nameof(ingredient));
            }

            var addedIngredient = await _context.Ingredients.AddAsync(ingredient);
            await _context.SaveChangesAsync();
            return addedIngredient.Entity;
        }

        public async Task<Ingredient> DeleteIngredientAsync(int id)
        {
            var ingredient = await _context.Ingredients.FindAsync(id) ?? throw new Exception("Ingredient not found");

            _context.Ingredients.Remove(ingredient);

            await _context.SaveChangesAsync();

            return ingredient;
        }
    }
}

using _2Eat.Application.Recipes;
using _2Eat.Domain;
using Microsoft.EntityFrameworkCore;

namespace _2Eat.Infrastructure.Recipes;

public class EfRecipeRepository : IRecipeRepository
{
    private readonly ApplicationDbContext _context;

    public EfRecipeRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public Task<List<Recipe>> GetAllAsync()
        => _context.Recipes
            .Include(x => x.Category)
            .Include(x => x.Ingredients)
                .ThenInclude(x => x.Ingredient)
            .Include(x => x.Ingredients)
                .ThenInclude(x => x.IngredientMeasurement)
            .AsNoTracking()
            .ToListAsync();

    public Task<List<Recipe>> GetRandomAsync(int count)
        => _context.Recipes
            .Include(x => x.Category)
            .AsNoTracking()
            .OrderBy(r => Guid.NewGuid())
            .Take(count)
            .ToListAsync();

    public Task<Recipe?> GetByIdAsync(int id)
        => _context.Recipes
            .Include(x => x.Category)
            .Include(x => x.Ingredients)
                .ThenInclude(x => x.Ingredient)
            .Include(x => x.Ingredients)
                .ThenInclude(x => x.IngredientMeasurement)
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id);

    public Task<Recipe?> GetWithIngredientsAsync(int id)
        => _context.Recipes
            .Include(x => x.Ingredients)
                .ThenInclude(x => x.Ingredient)
            .Include(x => x.Ingredients)
                .ThenInclude(x => x.IngredientMeasurement)
            .FirstOrDefaultAsync(x => x.Id == id);

    public Task<Ingredient?> FindIngredientByNameAsync(string name)
        => _context.Ingredients.FirstOrDefaultAsync(i => i.Name == name);

    public async Task<Ingredient> AddIngredientAsync(Ingredient ingredient)
    {
        var entry = await _context.Ingredients.AddAsync(ingredient);
        return entry.Entity;
    }

    public async Task<Recipe> AddAsync(Recipe recipe)
    {
        var entry = await _context.Recipes.AddAsync(recipe);
        await _context.SaveChangesAsync();
        return entry.Entity;
    }

    public async Task<Recipe> UpdateAsync(Recipe recipe)
    {
        await _context.SaveChangesAsync();
        return recipe;
    }

    public async Task<Recipe> RemoveAsync(Recipe recipe)
    {
        _context.Recipes.Remove(recipe);
        await _context.SaveChangesAsync();
        return recipe;
    }

    public Task SaveAsync() => _context.SaveChangesAsync();
}

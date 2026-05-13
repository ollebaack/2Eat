using _2Eat.Application.Recipes;
using _2Eat.Domain;
using _2Eat.Domain.Enums;
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
                    .ThenInclude(x => x.Allergens)
            .Include(x => x.Ingredients)
                .ThenInclude(x => x.IngredientMeasurement)
            .Include(x => x.Allergens)
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
                    .ThenInclude(x => x.Allergens)
            .Include(x => x.Ingredients)
                .ThenInclude(x => x.IngredientMeasurement)
            .Include(x => x.Allergens)
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id);

    public Task<Recipe?> GetWithIngredientsAsync(int id)
        => _context.Recipes
            .Include(x => x.Ingredients)
                .ThenInclude(x => x.Ingredient)
            .Include(x => x.Ingredients)
                .ThenInclude(x => x.IngredientMeasurement)
            .Include(x => x.Allergens)
            .FirstOrDefaultAsync(x => x.Id == id);

    public Task<Ingredient?> FindIngredientByNameAsync(string name)
        => _context.Ingredients.FirstOrDefaultAsync(i => i.Name == name);

    public Task<List<Allergen>> FindAllergensByIdsAsync(IEnumerable<AllergenEnum> ids)
        => _context.Allergens.Where(a => ids.Contains(a.Id)).ToListAsync();

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

    public Task<List<Category>> GetCategoriesAsync()
        => _context.Categories.AsNoTracking().OrderBy(c => c.Id).ToListAsync();

    public Task<Category?> FindCategoryByNameAsync(string name)
        => _context.Categories.AsNoTracking().FirstOrDefaultAsync(c => c.Name == name);
}

using _2Eat.Application;
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

    public Task<List<Recipe>> GetAllAsync(int userId)
        => _context.Recipes
            .Where(r => r.UserId == userId)
            .Include(x => x.Category)
            .Include(x => x.Ingredients)
                .ThenInclude(x => x.Ingredient)
                    .ThenInclude(x => x.Allergens)
            .Include(x => x.Ingredients)
                .ThenInclude(x => x.IngredientMeasurement)
            .Include(x => x.Allergens)
            .AsNoTracking()
            .ToListAsync();

    public async Task<PagedResult<Recipe>> GetPageAsync(RecipeQuery query)
    {
        var idQuery = _context.Recipes.AsNoTracking().Where(r => r.UserId == query.UserId).AsQueryable();

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var s = query.Search.ToLower();
            idQuery = idQuery.Where(r => r.Name.ToLower().Contains(s) ||
                                        (r.Description != null && r.Description.ToLower().Contains(s)));
        }

        if (query.CategoryId.HasValue)
            idQuery = idQuery.Where(r => r.CategoryId == query.CategoryId.Value);

        foreach (var allergen in query.Allergens)
            if (Enum.TryParse<AllergenEnum>(allergen, out var allergenEnum))
                idQuery = idQuery.Where(r => r.Allergens.Any(a => a.Id == allergenEnum));

        foreach (var ingId in query.IngredientIds)
            idQuery = idQuery.Where(r => r.Ingredients.Any(ri => ri.IngredientId == ingId));

        // Load all matching IDs in stable order, then apply seeded shuffle in memory
        var allIds = await idQuery.OrderBy(r => r.Id).Select(r => r.Id).ToListAsync();

        var seed = query.Seed == 0 ? 1 : query.Seed;
        var rng = new Random(seed);
        var shuffled = allIds
            .Select(id => (id, key: rng.NextDouble()))
            .OrderBy(x => x.key)
            .Select(x => x.id)
            .ToList();

        var offset = query.Page * query.PageSize;
        var pageIds = shuffled.Skip(offset).Take(query.PageSize).ToList();
        var hasMore = offset + query.PageSize < allIds.Count;

        if (pageIds.Count == 0)
            return new PagedResult<Recipe>([], hasMore, query.Page);

        var recipes = await _context.Recipes
            .Include(x => x.Category)
            .Include(x => x.Ingredients).ThenInclude(x => x.Ingredient).ThenInclude(x => x.Allergens)
            .Include(x => x.Ingredients).ThenInclude(x => x.IngredientMeasurement)
            .Include(x => x.Allergens)
            .AsNoTracking()
            .Where(r => pageIds.Contains(r.Id))
            .ToListAsync();

        var dict = recipes.ToDictionary(r => r.Id);
        var ordered = pageIds.Where(dict.ContainsKey).Select(id => dict[id]).ToList();

        return new PagedResult<Recipe>(ordered, hasMore, query.Page);
    }

    public Task<List<Recipe>> GetRandomAsync(int count, int userId)
        => _context.Recipes
            .Where(r => r.UserId == userId)
            .Include(x => x.Category)
            .AsNoTracking()
            .OrderBy(r => Guid.NewGuid())
            .Take(count)
            .ToListAsync();

    public Task<Recipe?> GetByIdAsync(int id, int userId)
        => _context.Recipes
            .Where(r => r.Id == id && r.UserId == userId)
            .Include(x => x.Category)
            .Include(x => x.Ingredients)
                .ThenInclude(x => x.Ingredient)
                    .ThenInclude(x => x.Allergens)
            .Include(x => x.Ingredients)
                .ThenInclude(x => x.IngredientMeasurement)
            .Include(x => x.Allergens)
            .AsNoTracking()
            .FirstOrDefaultAsync();

    public Task<Recipe?> GetWithIngredientsAsync(int id, int userId)
        => _context.Recipes
            .Where(r => r.Id == id && r.UserId == userId)
            .Include(x => x.Ingredients)
                .ThenInclude(x => x.Ingredient)
            .Include(x => x.Ingredients)
                .ThenInclude(x => x.IngredientMeasurement)
            .Include(x => x.Allergens)
            .FirstOrDefaultAsync();

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

using _2Eat.Application.Ingredients;
using _2Eat.Domain;
using Microsoft.EntityFrameworkCore;

namespace _2Eat.Infrastructure.Ingredients;

public class EfIngredientRepository(ApplicationDbContext context) : IIngredientRepository
{
    public Task<List<Ingredient>> GetAllAsync() =>
        context.Ingredients.ToListAsync();

    public async Task<Ingredient?> GetByIdAsync(int id) =>
        await context.Ingredients.FindAsync(id);

    public Task<Ingredient?> FindByNameAsync(string name) =>
        context.Ingredients.FirstOrDefaultAsync(i => i.Name == name);

    public async Task<Ingredient> AddAsync(Ingredient ingredient)
    {
        var entry = await context.Ingredients.AddAsync(ingredient);
        await context.SaveChangesAsync();
        return entry.Entity;
    }

    public async Task<Ingredient?> UpdateAsync(int id, string name, int categoryId)
    {
        var ingredient = await context.Ingredients.FindAsync(id);
        if (ingredient is null) return null;

        ingredient.Name = name;
        ingredient.CategoryId = categoryId;
        await context.SaveChangesAsync();
        return ingredient;
    }

    public async Task<Ingredient> RemoveAsync(Ingredient ingredient)
    {
        context.Ingredients.Remove(ingredient);
        await context.SaveChangesAsync();
        return ingredient;
    }

    public Task SaveAsync() => context.SaveChangesAsync();
}

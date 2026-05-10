using _2Eat.Domain;

namespace _2Eat.Application.Ingredients;

public interface IIngredientRepository
{
    Task<List<Ingredient>> GetAllAsync();
    Task<Ingredient?> GetByIdAsync(int id);
    Task<Ingredient?> FindByNameAsync(string name);
    Task<Ingredient> AddAsync(Ingredient ingredient);
    Task<Ingredient?> UpdateAsync(int id, string name, int categoryId);
    Task<Ingredient> RemoveAsync(Ingredient ingredient);
    Task SaveAsync();
}

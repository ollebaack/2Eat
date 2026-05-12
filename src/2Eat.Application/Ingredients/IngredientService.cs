using _2Eat.Domain;

namespace _2Eat.Application.Ingredients;

public class IngredientService(IIngredientRepository repository) : IIngredientService
{
    public Task<List<Ingredient>> GetIngredientsAsync() =>
        repository.GetAllAsync();

    public Task<Ingredient?> GetIngredientByIdAsync(int id) =>
        repository.GetByIdAsync(id);

    public async Task<Ingredient> AddIngredientAsync(Ingredient ingredient)
    {
        if (string.IsNullOrEmpty(ingredient.Name))
            throw new ArgumentException("Recipe name is required", nameof(ingredient));

        var existing = await repository.FindByNameAsync(ingredient.Name);
        if (existing is not null)
            return existing;

        return await repository.AddAsync(ingredient);
    }

    public Task<Ingredient?> UpdateIngredientAsync(int id, string name, int categoryId, decimal? pricePerUnit) =>
        repository.UpdateAsync(id, name, categoryId, pricePerUnit);

    public async Task<Ingredient> DeleteIngredientAsync(int id)
    {
        var ingredient = await repository.GetByIdAsync(id) ?? throw new Exception("Ingredient not found");
        return await repository.RemoveAsync(ingredient);
    }
}

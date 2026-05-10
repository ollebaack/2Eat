using _2Eat.Domain;

namespace _2Eat.Application.Recipes;

public class RecipeService : IRecipeService
{
    private readonly IRecipeRepository _repository;

    public RecipeService(IRecipeRepository repository)
    {
        _repository = repository;
    }

    public Task<List<Recipe>> GetRecipesAsync() => _repository.GetAllAsync();

    public Task<List<Recipe>> GetRandomRecipesAsync(int count) => _repository.GetRandomAsync(count);

    public Task<Recipe?> GetRecipeByIdAsync(int id) => _repository.GetByIdAsync(id);

    public async Task<Recipe> AddRecipeAsync(Recipe recipe)
    {
        if (string.IsNullOrEmpty(recipe.Name))
            throw new ArgumentException("Recipe name is required", nameof(recipe));

        if (recipe.CategoryId == 0)
            recipe.CategoryId = 5;

        foreach (var ri in recipe.Ingredients)
        {
            if (ri.Ingredient == null) continue;
            var existing = await _repository.FindIngredientByNameAsync(ri.Ingredient.Name);
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

        return await _repository.AddAsync(recipe);
    }

    public async Task<Recipe> UpdateRecipeAsync(int Id, Recipe recipe)
    {
        var recipeEntity = await _repository.GetWithIngredientsAsync(Id)
            ?? throw new Exception("Recipe not found");

        recipeEntity.Name = recipe.Name;
        recipeEntity.Description = recipe.Description;
        recipeEntity.Instructions = recipe.Instructions;
        recipeEntity.ImageUrl = recipe.ImageUrl;
        recipeEntity.LastModified = DateTimeOffset.Now;

        foreach (var recipeIngredient in recipe.Ingredients)
        {
            Ingredient addedIngredient;
            var existingIngredient = await _repository.FindIngredientByNameAsync(recipeIngredient.Ingredient.Name);
            if (existingIngredient != null)
            {
                addedIngredient = existingIngredient;
            }
            else
            {
                if (recipeIngredient.Ingredient.CategoryId == 0)
                    recipeIngredient.Ingredient.CategoryId = 5;
                addedIngredient = await _repository.AddIngredientAsync(recipeIngredient.Ingredient);
            }

            var existingRecipeIngredient = recipeEntity.Ingredients
                .FirstOrDefault(ri => ri.IngredientId == addedIngredient.Id);

            if (existingRecipeIngredient != null)
            {
                existingRecipeIngredient.Order = recipeIngredient.Order;
            }
            else
            {
                recipeEntity.Ingredients.Add(new RecipeIngredient
                {
                    RecipeId = recipeEntity.Id,
                    IngredientId = addedIngredient.Id,
                    Order = recipeIngredient.Order,
                    IngredientMeasurement = recipeIngredient.IngredientMeasurement
                });
            }
        }

        return await _repository.UpdateAsync(recipeEntity);
    }

    public async Task<Recipe> DeleteRecipeAsync(int id)
    {
        var recipe = await _repository.GetByIdAsync(id)
            ?? throw new Exception("Recipe not found");

        return await _repository.RemoveAsync(recipe);
    }
}

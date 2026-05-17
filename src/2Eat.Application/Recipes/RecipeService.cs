using _2Eat.Application;
using _2Eat.Domain;

namespace _2Eat.Application.Recipes;

public class RecipeService : IRecipeService
{
    private readonly IRecipeRepository _repository;

    public RecipeService(IRecipeRepository repository)
    {
        _repository = repository;
    }

    public Task<List<Recipe>> GetRecipesAsync(int userId) => _repository.GetAllAsync(userId);

    public Task<PagedResult<Recipe>> GetRecipesPageAsync(RecipeQuery query) => _repository.GetPageAsync(query);

    public Task<List<Category>> GetCategoriesAsync() => _repository.GetCategoriesAsync();

    public Task<List<Recipe>> GetRandomRecipesAsync(int count, int userId) => _repository.GetRandomAsync(count, userId);

    public Task<Recipe?> GetRecipeByIdAsync(int id, int userId) => _repository.GetByIdAsync(id, userId);

    public async Task<Recipe> AddRecipeAsync(Recipe recipe, int userId)
    {
        recipe.UserId = userId;

        if (string.IsNullOrEmpty(recipe.Name))
            throw new ArgumentException("Recipe name is required", nameof(recipe));

        if (recipe.CategoryId == 0)
            recipe.CategoryId = 5;

        // Deduplicate ingredients by name: if a scanned recipe contains the same
        // ingredient twice (or two names that normalise to the same title-case value),
        // reuse the same Ingredient object so EF doesn't try to INSERT it twice and
        // hit the IX_Ingredients_Name unique constraint.
        var resolvedIngredients = new Dictionary<string, Ingredient>(StringComparer.OrdinalIgnoreCase);

        foreach (var ri in recipe.Ingredients)
        {
            if (ri.Ingredient == null) continue;
            var name = ri.Ingredient.Name;

            if (resolvedIngredients.TryGetValue(name, out var cached))
            {
                ri.Ingredient = cached;
                ri.IngredientId = cached.Id;
                continue;
            }

            var existing = await _repository.FindIngredientByNameAsync(name);
            if (existing != null)
            {
                ri.Ingredient = existing;
                ri.IngredientId = existing.Id;
                resolvedIngredients[name] = existing;
            }
            else
            {
                if (ri.Ingredient.CategoryId == 0)
                    ri.Ingredient.CategoryId = 5;
                resolvedIngredients[name] = ri.Ingredient;
            }
        }

        // Composite PK is {RecipeId, IngredientId} — drop duplicates EF would reject.
        recipe.Ingredients = recipe.Ingredients
            .DistinctBy(ri => ri.Ingredient)
            .ToList();

        // Resolve allergens: replace deserialized stubs with tracked entities from DB
        if (recipe.Allergens.Count > 0)
        {
            var ids = recipe.Allergens.Select(a => a.Id).ToList();
            recipe.Allergens = await _repository.FindAllergensByIdsAsync(ids);
        }

        return await _repository.AddAsync(recipe);
    }

    public async Task<Recipe> UpdateRecipeAsync(int Id, Recipe recipe, int userId)
    {
        var recipeEntity = await _repository.GetWithIngredientsAsync(Id, userId)
            ?? throw new Exception("Recipe not found");

        recipeEntity.Name = recipe.Name;
        recipeEntity.Description = recipe.Description;
        recipeEntity.Instructions = recipe.Instructions;
        recipeEntity.ImageUrl = recipe.ImageUrl;
        recipeEntity.CategoryId = recipe.CategoryId;
        recipeEntity.LastModified = DateTimeOffset.UtcNow;
        recipeEntity.Calories = recipe.Calories;
        recipeEntity.Protein = recipe.Protein;
        recipeEntity.Fat = recipe.Fat;
        recipeEntity.Carbs = recipe.Carbs;

        // Same deduplication guard as AddRecipeAsync.
        var resolvedIngredients = new Dictionary<string, Ingredient>(StringComparer.OrdinalIgnoreCase);

        foreach (var recipeIngredient in recipe.Ingredients)
        {
            var name = recipeIngredient.Ingredient.Name;

            Ingredient addedIngredient;
            if (resolvedIngredients.TryGetValue(name, out var cached))
            {
                addedIngredient = cached;
            }
            else
            {
                var existingIngredient = await _repository.FindIngredientByNameAsync(name);
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
                resolvedIngredients[name] = addedIngredient;
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

        // Update allergens: clear existing, attach resolved tracked entities
        recipeEntity.Allergens.Clear();
        if (recipe.Allergens.Count > 0)
        {
            var ids = recipe.Allergens.Select(a => a.Id).ToList();
            var tracked = await _repository.FindAllergensByIdsAsync(ids);
            foreach (var allergen in tracked)
                recipeEntity.Allergens.Add(allergen);
        }

        return await _repository.UpdateAsync(recipeEntity);
    }

    public async Task<Recipe> DeleteRecipeAsync(int id, int userId)
    {
        var recipe = await _repository.GetByIdAsync(id, userId)
            ?? throw new Exception("Recipe not found");

        return await _repository.RemoveAsync(recipe);
    }
}

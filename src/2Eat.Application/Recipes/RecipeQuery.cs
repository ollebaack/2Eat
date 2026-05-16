namespace _2Eat.Application.Recipes;

public class RecipeQuery
{
    public string? Search { get; init; }
    public int? CategoryId { get; init; }
    public List<string> Allergens { get; init; } = [];
    public List<int> IngredientIds { get; init; } = [];
    public int Page { get; init; } = 0;
    public int PageSize { get; init; } = 8;
    public int Seed { get; init; } = 1;
}

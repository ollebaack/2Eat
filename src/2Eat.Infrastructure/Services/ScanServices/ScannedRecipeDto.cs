namespace _2Eat.Infrastructure.Services.ScanServices
{
    public record ScannedIngredientDto(string Name, double Quantity, string Unit);

    public record ScannedRecipeDto(
        string? Name,
        string? Description,
        string[]? Steps,
        int? Servings,
        int? PrepTime,
        int? CookTime,
        string? Difficulty,
        ScannedIngredientDto[]? Ingredients
    );
}

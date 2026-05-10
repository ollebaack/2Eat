using _2Eat.Application.Recipes.Dtos;

namespace _2Eat.Application.Recipes;

public interface IRecipeScanService
{
    bool IsConfigured { get; }
    Task<ScannedRecipeDto> ScanFromImageAsync(Stream imageStream, string contentType, CancellationToken ct = default);
    Task<ScannedRecipeDto> ScanFromUrlAsync(string url, CancellationToken ct = default);
}

namespace _2Eat.Infrastructure.Services.ScanServices
{
    public interface IRecipeScanService
    {
        bool IsConfigured { get; }
        Task<ScannedRecipeDto> ScanFromImageAsync(Stream imageStream, string contentType, CancellationToken ct = default);
        Task<ScannedRecipeDto> ScanFromUrlAsync(string url, CancellationToken ct = default);
    }
}

using _2Eat.Infrastructure.Services.ScanServices;
using Microsoft.AspNetCore.Http.HttpResults;

namespace _2Eat.Web.API
{
    public static class RecipeScanEndpoints
    {
        public static void MapRecipeScanEndpoints(this IEndpointRouteBuilder endpoints)
        {
            endpoints.MapGet("/api/recipes/scan/status", GetScanStatus)
                     .RequireAuthorization();

            endpoints.MapPost("/api/recipes/scan/image", ScanFromImage)
                     .DisableAntiforgery()
                     .RequireAuthorization();

            endpoints.MapPost("/api/recipes/scan/url", ScanFromUrl)
                     .RequireAuthorization();
        }

        static IResult GetScanStatus(IRecipeScanService svc)
            => Results.Ok(new { enabled = svc.IsConfigured });

        static async Task<Results<Ok<ScannedRecipeDto>, BadRequest<string>, StatusCodeHttpResult>>
            ScanFromImage(IFormFile file, IRecipeScanService svc, CancellationToken ct)
        {
            if (!svc.IsConfigured)
                return TypedResults.StatusCode(503);

            if (file.Length == 0)
                return TypedResults.BadRequest("No file provided.");

            if (file.Length > 10 * 1024 * 1024)
                return TypedResults.BadRequest("Image must be under 10 MB.");

            var allowed = new[] { "image/jpeg", "image/png", "image/gif", "image/webp" };
            if (!allowed.Contains(file.ContentType))
                return TypedResults.BadRequest("Unsupported image type.");

            try
            {
                await using var stream = file.OpenReadStream();
                var result = await svc.ScanFromImageAsync(stream, file.ContentType, ct);
                return TypedResults.Ok(result);
            }
            catch
            {
                return TypedResults.StatusCode(502);
            }
        }

        record ScanUrlRequest(string Url);

        static async Task<Results<Ok<ScannedRecipeDto>, BadRequest<string>, StatusCodeHttpResult>>
            ScanFromUrl(ScanUrlRequest req, IRecipeScanService svc, CancellationToken ct)
        {
            if (!svc.IsConfigured)
                return TypedResults.StatusCode(503);

            if (string.IsNullOrWhiteSpace(req.Url) || !Uri.TryCreate(req.Url, UriKind.Absolute, out _))
                return TypedResults.BadRequest("Invalid URL.");

            try
            {
                var result = await svc.ScanFromUrlAsync(req.Url, ct);
                return TypedResults.Ok(result);
            }
            catch (HttpRequestException)
            {
                return TypedResults.BadRequest("Could not fetch the URL.");
            }
            catch
            {
                return TypedResults.StatusCode(502);
            }
        }
    }
}

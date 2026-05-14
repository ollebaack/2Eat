using _2Eat.Application.Files;
using _2Eat.Application.Recipes;
using _2Eat.Application.Recipes.Dtos;
using _2Eat.Domain.Files;
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

        static async Task<Results<Ok<ScannedRecipeDto>, ProblemHttpResult, StatusCodeHttpResult>>
            ScanFromImage(IFormFile file, IRecipeScanService svc, IWebHostEnvironment env, IFileService fileService, CancellationToken ct)
        {
            if (!svc.IsConfigured)
                return TypedResults.StatusCode(503);

            if (file.Length == 0)
                return TypedResults.Problem(detail: "No file provided.", statusCode: 400);

            if (file.Length > 10 * 1024 * 1024)
                return TypedResults.Problem(detail: "Image must be under 10 MB.", statusCode: 400);

            var allowed = new[] { "image/jpeg", "image/png", "image/gif", "image/webp" };
            if (!allowed.Contains(file.ContentType))
                return TypedResults.Problem(detail: "Unsupported image type.", statusCode: 400);

            byte[] bytes;
            using (var ms = new MemoryStream())
            {
                await file.CopyToAsync(ms, ct);
                bytes = ms.ToArray();
            }

            ScannedRecipeDto result;
            try
            {
                await using var scanStream = new MemoryStream(bytes);
                result = await svc.ScanFromImageAsync(scanStream, file.ContentType, ct);
            }
            catch
            {
                return TypedResults.StatusCode(502);
            }

            var storedFileName = Path.GetRandomFileName();
            var path = Path.Combine(env.ContentRootPath, "uploads", storedFileName);
            await System.IO.File.WriteAllBytesAsync(path, bytes, ct);
            await fileService.AddFileAsync(new FileUpload
            {
                FileName = file.FileName,
                StoredFileName = storedFileName,
                ContentType = file.ContentType,
                FileSize = file.Length,
                IsSuccess = true,
            });

            return TypedResults.Ok(result with { ImageUrl = storedFileName });
        }

        record ScanUrlRequest(string Url);

        static async Task<Results<Ok<ScannedRecipeDto>, ProblemHttpResult, StatusCodeHttpResult>>
            ScanFromUrl(ScanUrlRequest req, IRecipeScanService svc, IWebHostEnvironment env, IFileService fileService, IHttpClientFactory httpFactory, CancellationToken ct)
        {
            if (!svc.IsConfigured)
                return TypedResults.StatusCode(503);

            if (string.IsNullOrWhiteSpace(req.Url) || !Uri.TryCreate(req.Url, UriKind.Absolute, out _))
                return TypedResults.Problem(detail: "Invalid URL.", statusCode: 400);

            ScannedRecipeDto result;
            try
            {
                result = await svc.ScanFromUrlAsync(req.Url, ct);
            }
            catch (HttpRequestException)
            {
                return TypedResults.Problem(detail: "Could not fetch the URL.", statusCode: 400);
            }
            catch
            {
                return TypedResults.StatusCode(502);
            }

            if (!string.IsNullOrWhiteSpace(result.ImageUrl))
            {
                try
                {
                    var http = httpFactory.CreateClient("RecipeScan");
                    var imageBytes = await http.GetByteArrayAsync(result.ImageUrl, ct);
                    var contentType = DetectImageContentType(result.ImageUrl);

                    var storedFileName = Path.GetRandomFileName();
                    var path = Path.Combine(env.ContentRootPath, "uploads", storedFileName);
                    await System.IO.File.WriteAllBytesAsync(path, imageBytes, ct);
                    await fileService.AddFileAsync(new FileUpload
                    {
                        FileName = Path.GetFileName(new Uri(result.ImageUrl).LocalPath),
                        StoredFileName = storedFileName,
                        ContentType = contentType,
                        FileSize = imageBytes.Length,
                        IsSuccess = true,
                    });
                    result = result with { ImageUrl = storedFileName };
                }
                catch
                {
                    result = result with { ImageUrl = null };
                }
            }

            return TypedResults.Ok(result);
        }

        static string DetectImageContentType(string url)
        {
            var ext = Path.GetExtension(new Uri(url).LocalPath).ToLowerInvariant().Split('?')[0];
            return ext switch
            {
                ".jpg" or ".jpeg" => "image/jpeg",
                ".png" => "image/png",
                ".gif" => "image/gif",
                ".webp" => "image/webp",
                _ => "image/jpeg",
            };
        }
    }
}

using _2Eat.Application.Pantry;
using _2Eat.Domain;
using System.Security.Claims;

namespace _2Eat.Web.API
{
    public static class PantryEndpoints
    {
        public static void MapPantryEndpoints(this IEndpointRouteBuilder endpoints)
        {
            endpoints.MapGet("/api/pantry", GetAll).RequireAuthorization();
            endpoints.MapPost("/api/pantry", Create).RequireAuthorization();
            endpoints.MapPut("/api/pantry/{id}", Update).RequireAuthorization();
            endpoints.MapDelete("/api/pantry/{id}", Delete).RequireAuthorization();
            endpoints.MapPost("/api/pantry/scan-receipt", ScanReceipt)
                     .DisableAntiforgery()
                     .RequireAuthorization();
        }

        static async Task<IResult> GetAll(IPantryItemService service, ClaimsPrincipal principal)
        {
            var userId = principal.GetUserId();
            if (userId is null) return Results.Unauthorized();
            return Results.Ok(await service.GetAllAsync(userId.Value));
        }

        static async Task<IResult> Create(IPantryItemService service, HttpContext context, ClaimsPrincipal principal)
        {
            var userId = principal.GetUserId();
            if (userId is null) return Results.Unauthorized();
            var item = await context.Request.ReadFromJsonAsync<PantryItem>();
            if (item == null) return TypedResults.Problem(detail: "Invalid request body.", statusCode: 400);
            return Results.Ok(await service.CreateAsync(userId.Value, item));
        }

        static async Task<IResult> Update(int id, IPantryItemService service, HttpContext context, ClaimsPrincipal principal)
        {
            var userId = principal.GetUserId();
            if (userId is null) return Results.Unauthorized();
            var item = await context.Request.ReadFromJsonAsync<PantryItem>();
            if (item == null) return TypedResults.Problem(detail: "Invalid request body.", statusCode: 400);
            try { return Results.Ok(await service.UpdateAsync(userId.Value, id, item)); }
            catch (KeyNotFoundException) { return Results.NotFound(); }
        }

        static async Task<IResult> Delete(int id, IPantryItemService service, ClaimsPrincipal principal)
        {
            var userId = principal.GetUserId();
            if (userId is null) return Results.Unauthorized();
            await service.DeleteAsync(userId.Value, id);
            return Results.NoContent();
        }

        static async Task<IResult> ScanReceipt(IFormFile file, IReceiptScanService scanService)
        {
            string[] allowed = ["image/jpeg", "image/png", "image/gif", "image/webp"];
            if (!allowed.Contains(file.ContentType, StringComparer.OrdinalIgnoreCase))
                return TypedResults.Problem(detail: "Unsupported image type. Use JPEG, PNG, GIF or WEBP.", statusCode: 400);

            using var ms = new MemoryStream();
            await file.CopyToAsync(ms);
            var items = await scanService.ScanReceiptAsync(ms.ToArray(), file.ContentType);
            return Results.Ok(items);
        }

    }
}

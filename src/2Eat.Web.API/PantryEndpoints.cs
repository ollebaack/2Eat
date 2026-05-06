using _2Eat.Domain;
using _2Eat.Infrastructure.Services.PantryServices;
using _2Eat.Infrastructure.Services.ReceiptScanServices;

namespace _2Eat.Web.API
{
    public static class PantryEndpoints
    {
        public static void MapPantryEndpoints(this IEndpointRouteBuilder endpoints)
        {
            endpoints.MapGet("/api/pantry", GetAll);
            endpoints.MapPost("/api/pantry", Create);
            endpoints.MapPut("/api/pantry/{id}", Update);
            endpoints.MapDelete("/api/pantry/{id}", Delete);
            endpoints.MapPost("/api/pantry/scan-receipt", ScanReceipt)
                     .DisableAntiforgery()
                     .RequireAuthorization();
        }

        static async Task<IResult> GetAll(IPantryItemService service) =>
            Results.Ok(await service.GetAllAsync());

        static async Task<IResult> Create(IPantryItemService service, HttpContext context)
        {
            var item = await context.Request.ReadFromJsonAsync<PantryItem>();
            if (item == null) return Results.BadRequest();
            return Results.Ok(await service.CreateAsync(item));
        }

        static async Task<IResult> Update(int id, IPantryItemService service, HttpContext context)
        {
            var item = await context.Request.ReadFromJsonAsync<PantryItem>();
            if (item == null) return Results.BadRequest();
            try { return Results.Ok(await service.UpdateAsync(id, item)); }
            catch (KeyNotFoundException) { return Results.NotFound(); }
        }

        static async Task<IResult> Delete(int id, IPantryItemService service)
        {
            await service.DeleteAsync(id);
            return Results.NoContent();
        }

        static async Task<IResult> ScanReceipt(IFormFile file, IReceiptScanService scanService)
        {
            string[] allowed = ["image/jpeg", "image/png", "image/gif", "image/webp"];
            if (!allowed.Contains(file.ContentType, StringComparer.OrdinalIgnoreCase))
                return Results.BadRequest(new { detail = "Unsupported image type. Use JPEG, PNG, GIF or WEBP." });

            using var ms = new MemoryStream();
            await file.CopyToAsync(ms);
            var items = await scanService.ScanReceiptAsync(ms.ToArray(), file.ContentType);
            return Results.Ok(items);
        }
    }
}

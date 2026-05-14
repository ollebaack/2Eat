using _2Eat.Application.ShoppingLists;
using System.Security.Claims;

namespace _2Eat.Web.API
{
    public static class ShoppingListEndpoints
    {
        public static void MapShoppingListEndpoints(this IEndpointRouteBuilder endpoints)
        {
            var group = endpoints.MapGroup("/api/shopping-list").RequireAuthorization();

            group.MapGet("/", GetItems);
            group.MapPost("/", AddItem);
            group.MapPut("/{id}", UpdateItem);
            group.MapDelete("/{id}", DeleteItem);
            group.MapPost("/from-recipe/{recipeId}", AddFromRecipe);
        }

        static async Task<IResult> GetItems(ClaimsPrincipal principal, IShoppingListService service)
        {
            var userId = principal.GetUserId();
            if (userId is null) return Results.Unauthorized();
            var items = await service.GetItemsAsync(userId.Value);
            return Results.Ok(items);
        }

        static async Task<IResult> AddItem(ClaimsPrincipal principal, IShoppingListService service, HttpContext context)
        {
            var userId = principal.GetUserId();
            if (userId is null) return Results.Unauthorized();
            var req = await context.Request.ReadFromJsonAsync<AddItemRequest>();
            if (req == null || string.IsNullOrWhiteSpace(req.Name)) return TypedResults.Problem(detail: "Invalid request body.", statusCode: 400);
            var item = await service.AddItemAsync(userId.Value, req.Name, req.Quantity, req.Unit);
            return Results.Ok(item);
        }

        static async Task<IResult> UpdateItem(int id, ClaimsPrincipal principal, IShoppingListService service, HttpContext context)
        {
            var userId = principal.GetUserId();
            if (userId is null) return Results.Unauthorized();
            var req = await context.Request.ReadFromJsonAsync<UpdateItemRequest>();
            if (req == null) return TypedResults.Problem(detail: "Invalid request body.", statusCode: 400);
            try
            {
                var item = await service.UpdateItemAsync(id, userId.Value, req.IsChecked);
                return Results.Ok(item);
            }
            catch (KeyNotFoundException)
            {
                return Results.NotFound();
            }
        }

        static async Task<IResult> DeleteItem(int id, ClaimsPrincipal principal, IShoppingListService service)
        {
            var userId = principal.GetUserId();
            if (userId is null) return Results.Unauthorized();
            await service.DeleteItemAsync(id, userId.Value);
            return Results.NoContent();
        }

        static async Task<IResult> AddFromRecipe(int recipeId, ClaimsPrincipal principal, IShoppingListService service)
        {
            var userId = principal.GetUserId();
            if (userId is null) return Results.Unauthorized();
            try
            {
                await service.AddRecipeIngredientsAsync(recipeId, userId.Value);
                return Results.NoContent();
            }
            catch (KeyNotFoundException)
            {
                return Results.NotFound();
            }
        }
    }

    record AddItemRequest(string Name, double? Quantity, string? Unit);
    record UpdateItemRequest(bool IsChecked);
}

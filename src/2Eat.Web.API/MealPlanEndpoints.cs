using _2Eat.Application.MealPlanning;
using System.Security.Claims;

namespace _2Eat.Web.API
{
    public static class MealPlanEndpoints
    {
        public static void MapMealPlanEndpoints(this IEndpointRouteBuilder endpoints)
        {
            endpoints.MapGet("/api/mealplan/week/{weekStartDate}", GetWeekPlan).RequireAuthorization();
            endpoints.MapPut("/api/mealplan/week/{weekStartDate}/day/{dayOfWeek}", SetDaySlot).RequireAuthorization();
            endpoints.MapDelete("/api/mealplan/week/{weekStartDate}/day/{dayOfWeek}", ClearDaySlot).RequireAuthorization();
        }

        static async Task<IResult> GetWeekPlan(string weekStartDate, IMealPlanService service, ClaimsPrincipal principal)
        {
            var userId = principal.GetUserId();
            if (userId is null) return Results.Unauthorized();
            if (!DateOnly.TryParse(weekStartDate, out var date))
                return TypedResults.Problem(detail: "Invalid date format. Use YYYY-MM-DD.", statusCode: 400);
            var plan = await service.GetWeekPlanAsync(userId.Value, date);
            return Results.Ok(plan);
        }

        static async Task<IResult> SetDaySlot(string weekStartDate, int dayOfWeek, IMealPlanService service, HttpContext context, ClaimsPrincipal principal)
        {
            var userId = principal.GetUserId();
            if (userId is null) return Results.Unauthorized();
            if (!DateOnly.TryParse(weekStartDate, out var date))
                return TypedResults.Problem(detail: "Invalid date format.", statusCode: 400);
            if (dayOfWeek < 0 || dayOfWeek > 6)
                return TypedResults.Problem(detail: "dayOfWeek must be between 0 (Sunday) and 6 (Saturday).", statusCode: 400);
            var body = await context.Request.ReadFromJsonAsync<SetDaySlotRequest>();
            if (body == null) return TypedResults.Problem(detail: "Invalid request body.", statusCode: 400);
            try
            {
                var day = await service.SetDaySlotAsync(userId.Value, date, dayOfWeek, body.RecipeId, body.Note ?? string.Empty);
                return Results.Ok(day);
            }
            catch (ArgumentException ex)
            {
                return TypedResults.Problem(detail: ex.Message, statusCode: 400);
            }
        }

        static async Task<IResult> ClearDaySlot(string weekStartDate, int dayOfWeek, IMealPlanService service, ClaimsPrincipal principal)
        {
            var userId = principal.GetUserId();
            if (userId is null) return Results.Unauthorized();
            if (!DateOnly.TryParse(weekStartDate, out var date))
                return TypedResults.Problem(detail: "Invalid date format.", statusCode: 400);
            await service.ClearDaySlotAsync(userId.Value, date, dayOfWeek);
            return Results.NoContent();
        }
    }

    record SetDaySlotRequest(int? RecipeId, string? Note);
}

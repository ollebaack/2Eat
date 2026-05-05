using _2Eat.Infrastructure.Services.MealPlanServices;

namespace _2Eat.Web.API
{
    public static class MealPlanEndpoints
    {
        public static void MapMealPlanEndpoints(this IEndpointRouteBuilder endpoints)
        {
            endpoints.MapGet("/api/mealplan/week/{weekStartDate}", GetWeekPlan);
            endpoints.MapPut("/api/mealplan/week/{weekStartDate}/day/{dayOfWeek}", SetDaySlot);
            endpoints.MapDelete("/api/mealplan/week/{weekStartDate}/day/{dayOfWeek}", ClearDaySlot);
        }

        static async Task<IResult> GetWeekPlan(string weekStartDate, IMealPlanService service)
        {
            if (!DateOnly.TryParse(weekStartDate, out var date))
                return Results.BadRequest("Invalid date format. Use YYYY-MM-DD.");
            var plan = await service.GetWeekPlanAsync(date);
            return Results.Ok(plan);
        }

        static async Task<IResult> SetDaySlot(string weekStartDate, int dayOfWeek, IMealPlanService service, HttpContext context)
        {
            if (!DateOnly.TryParse(weekStartDate, out var date))
                return Results.BadRequest("Invalid date format.");
            var body = await context.Request.ReadFromJsonAsync<SetDaySlotRequest>();
            if (body == null) return Results.BadRequest();
            var day = await service.SetDaySlotAsync(date, dayOfWeek, body.RecipeId, body.Note ?? string.Empty);
            return Results.Ok(day);
        }

        static async Task<IResult> ClearDaySlot(string weekStartDate, int dayOfWeek, IMealPlanService service)
        {
            if (!DateOnly.TryParse(weekStartDate, out var date))
                return Results.BadRequest("Invalid date format.");
            await service.ClearDaySlotAsync(date, dayOfWeek);
            return Results.NoContent();
        }
    }

    record SetDaySlotRequest(int? RecipeId, string? Note);
}

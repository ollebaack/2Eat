using _2Eat.Domain;

namespace _2Eat.Infrastructure.Services.MealPlanServices
{
    public interface IMealPlanService
    {
        Task<MealPlan> GetWeekPlanAsync(DateOnly weekStart);
        Task<MealPlanDay> SetDaySlotAsync(DateOnly weekStart, int dayOfWeek, int? recipeId, string note);
        Task ClearDaySlotAsync(DateOnly weekStart, int dayOfWeek);
    }
}

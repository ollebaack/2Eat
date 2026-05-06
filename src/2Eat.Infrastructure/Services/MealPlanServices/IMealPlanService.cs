using _2Eat.Domain;

namespace _2Eat.Infrastructure.Services.MealPlanServices
{
    public interface IMealPlanService
    {
        Task<MealPlan> GetWeekPlanAsync(int userId, DateOnly weekStart);
        Task<MealPlanDay> SetDaySlotAsync(int userId, DateOnly weekStart, int dayOfWeek, int? recipeId, string note);
        Task ClearDaySlotAsync(int userId, DateOnly weekStart, int dayOfWeek);
    }
}

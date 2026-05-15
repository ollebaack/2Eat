using _2Eat.Domain;

namespace _2Eat.Application.MealPlanning;

public interface IMealPlanRepository
{
    Task<MealPlan?> GetByUserAndWeekAsync(int userId, DateOnly weekStart);
    Task<MealPlan> AddAsync(MealPlan plan);
    Task<MealPlanDay?> GetDayAsync(int mealPlanId, int dayOfWeek);
    Task<MealPlanDay> AddDayAsync(MealPlanDay day);
    Task RemoveDayAsync(MealPlanDay day);
    Task SaveAsync();
    Task<bool> IsRecipeDinnerEligibleAsync(int recipeId);
}

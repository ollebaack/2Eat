using _2Eat.Domain;

namespace _2Eat.Application.MealPlanning;

public class MealPlanService(IMealPlanRepository repository) : IMealPlanService
{
    public async Task<MealPlan> GetWeekPlanAsync(int userId, DateOnly weekStart)
    {
        var plan = await repository.GetByUserAndWeekAsync(userId, weekStart);
        if (plan == null)
        {
            plan = new MealPlan { UserId = userId, WeekStartDate = weekStart };
            plan = await repository.AddAsync(plan);
        }
        return plan;
    }

    public async Task<MealPlanDay> SetDaySlotAsync(int userId, DateOnly weekStart, int dayOfWeek, int? recipeId, string note)
    {
        if (recipeId.HasValue && !await repository.IsRecipeDinnerEligibleAsync(recipeId.Value))
            throw new ArgumentException("Det valda receptet passar inte i veckoplanen.");

        var plan = await GetWeekPlanAsync(userId, weekStart);

        var day = await repository.GetDayAsync(plan.Id, dayOfWeek);
        if (day == null)
        {
            day = new MealPlanDay { MealPlanId = plan.Id, DayOfWeek = dayOfWeek };
            day = await repository.AddDayAsync(day);
        }

        day.RecipeId = recipeId;
        day.Note = note;
        await repository.SaveAsync();
        return day;
    }

    public async Task ClearDaySlotAsync(int userId, DateOnly weekStart, int dayOfWeek)
    {
        var plan = await repository.GetByUserAndWeekAsync(userId, weekStart);
        if (plan == null) return;

        var day = await repository.GetDayAsync(plan.Id, dayOfWeek);
        if (day != null)
            await repository.RemoveDayAsync(day);
    }
}

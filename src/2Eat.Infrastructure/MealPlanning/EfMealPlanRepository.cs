using _2Eat.Application.MealPlanning;
using _2Eat.Domain;
using Microsoft.EntityFrameworkCore;

namespace _2Eat.Infrastructure.MealPlanning;

public class EfMealPlanRepository(ApplicationDbContext db) : IMealPlanRepository
{
    public Task<MealPlan?> GetByUserAndWeekAsync(int userId, DateOnly weekStart)
        => db.MealPlans
            .Include(p => p.Days)
            .FirstOrDefaultAsync(p => p.UserId == userId && p.WeekStartDate == weekStart);

    public async Task<MealPlan> AddAsync(MealPlan plan)
    {
        db.MealPlans.Add(plan);
        await db.SaveChangesAsync();
        return plan;
    }

    public Task<MealPlanDay?> GetDayAsync(int mealPlanId, int dayOfWeek)
        => db.MealPlanDays.FirstOrDefaultAsync(d => d.MealPlanId == mealPlanId && d.DayOfWeek == dayOfWeek);

    public async Task<MealPlanDay> AddDayAsync(MealPlanDay day)
    {
        db.MealPlanDays.Add(day);
        await db.SaveChangesAsync();
        return day;
    }

    public async Task RemoveDayAsync(MealPlanDay day)
    {
        db.MealPlanDays.Remove(day);
        await db.SaveChangesAsync();
    }

    public Task SaveAsync() => db.SaveChangesAsync();

    public Task<bool> IsRecipeDinnerEligibleAsync(int recipeId)
        => db.Recipes
            .Where(r => r.Id == recipeId)
            .Select(r => r.Category.IsDinnerEligible)
            .FirstOrDefaultAsync();
}

using _2Eat.Domain;
using Microsoft.EntityFrameworkCore;

namespace _2Eat.Infrastructure.Services.MealPlanServices
{
    public class MealPlanService(ApplicationDbContext db) : IMealPlanService
    {
        public async Task<MealPlan> GetWeekPlanAsync(DateOnly weekStart)
        {
            var plan = await db.MealPlans
                .Include(p => p.Days)
                .FirstOrDefaultAsync(p => p.WeekStartDate == weekStart);

            if (plan == null)
            {
                plan = new MealPlan { WeekStartDate = weekStart };
                db.MealPlans.Add(plan);
                await db.SaveChangesAsync();
            }

            return plan;
        }

        public async Task<MealPlanDay> SetDaySlotAsync(DateOnly weekStart, int dayOfWeek, int? recipeId, string note)
        {
            var plan = await GetWeekPlanAsync(weekStart);

            var day = plan.Days.FirstOrDefault(d => d.DayOfWeek == dayOfWeek);
            if (day == null)
            {
                day = new MealPlanDay { MealPlanId = plan.Id, DayOfWeek = dayOfWeek };
                db.MealPlanDays.Add(day);
            }

            day.RecipeId = recipeId;
            day.Note = note;
            await db.SaveChangesAsync();
            return day;
        }

        public async Task ClearDaySlotAsync(DateOnly weekStart, int dayOfWeek)
        {
            var plan = await db.MealPlans
                .Include(p => p.Days)
                .FirstOrDefaultAsync(p => p.WeekStartDate == weekStart);

            if (plan == null) return;

            var day = plan.Days.FirstOrDefault(d => d.DayOfWeek == dayOfWeek);
            if (day != null)
            {
                db.MealPlanDays.Remove(day);
                await db.SaveChangesAsync();
            }
        }
    }
}

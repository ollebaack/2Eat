using System.ComponentModel.DataAnnotations;

namespace _2Eat.Domain
{
    public class MealPlanDay
    {
        [Key]
        public int Id { get; set; }
        public int MealPlanId { get; set; }
        public MealPlan MealPlan { get; set; } = null!;
        public int Day { get; set; }
        public ICollection<MealPlanDayMeal> Meals { get; set; } = new List<MealPlanDayMeal>();
    }
}
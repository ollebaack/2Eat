using System.ComponentModel.DataAnnotations;

namespace _2Eat.Domain
{
    public class MealPlanDay
    {
        [Key]
        public int Id { get; set; }
        public int MealPlanId { get; set; }
        public MealPlan MealPlan { get; set; } = null!;
        public int DayOfWeek { get; set; }  // 1=Monday ... 7=Sunday
        public int? RecipeId { get; set; }
        public string Note { get; set; } = string.Empty;
    }
}

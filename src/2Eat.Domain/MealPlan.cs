using System.ComponentModel.DataAnnotations;

namespace _2Eat.Domain
{
    public class MealPlan
    {
        [Key]
        public int Id { get; set; }
        public DateOnly WeekStartDate { get; set; }
        public ICollection<MealPlanDay> Days { get; set; } = new List<MealPlanDay>();
    }
}

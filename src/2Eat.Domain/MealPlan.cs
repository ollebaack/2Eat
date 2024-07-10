using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace _2Eat.Domain
{
    public class MealPlan
    {
        [Key]
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public User User { get; set; } = null!;
        //public ICollection<MealPlanDay> Days { get; set; } = new List<MealPlanDay>();
    }
}

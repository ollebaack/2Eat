using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace _2Eat.Domain
{
    public class User
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [EmailAddress]
        public string Email { get; set; } = null!;
        public ShoppingList ShoppingList { get; set; } = null!;
        public ICollection<MealPlan> MealPlans { get; set; } = new List<MealPlan>();
        // Additional properties like Password, Name, Preferences, etc.
        public int ShoppingListId { get; set; }
    }

}

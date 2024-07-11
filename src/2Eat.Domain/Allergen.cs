using _2Eat.Domain.Enums;
using System.ComponentModel.DataAnnotations;

namespace _2Eat.Domain
{
    public class Allergen
    {
        [Key]
        public AllergenEnum Id { get; set; }
        public ICollection<Ingredient> Ingredients { get; set; } = new List<Ingredient>();
    }
}
using System.ComponentModel.DataAnnotations;

namespace _2Eat.Domain
{
    public class Ingredient
    {
        [Key]
        public int Id { get; set; }

        [Required(ErrorMessage = "Please enter a name.")]
        [MaxLength(64)]
        public string Name { get; set; } = null!;
        public Category Category { get; set; } = null!;
        public ICollection<Allergens> Allergens { get; set; } = new List<Allergens>();
        public ICollection<RecipeIngredient> Recipes { get; set; } = new List<RecipeIngredient>();

        public int CategoryId { get; set; }
    }
}
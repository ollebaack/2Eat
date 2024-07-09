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

        public ICollection<Recipe> Recipes { get; set; } = new List<Recipe>();
    }
}
using System.ComponentModel.DataAnnotations;

namespace _2Eat.Domain
{
    public class Recipe
    {
        [Key]
        public int Id { get; set; }

        [Required(ErrorMessage = "Please enter a name.")]
        [MaxLength(64)]
        public string Name { get; set; } = null!;

        public ICollection<Ingredient> Ingredients { get; set; } = new List<Ingredient>();

        public string Instructions { get; set; } = string.Empty;
    }
}
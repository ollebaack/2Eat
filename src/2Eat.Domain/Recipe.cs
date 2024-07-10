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
        public string Description { get; set; } = string.Empty;

        public Category Category { get; set; } = null!;

        public ICollection<RecipeIngredient> Ingredients { get; set; } = new List<RecipeIngredient>();

        public string Instructions { get; set; } = string.Empty;
        public int Servings { get; set; }
        public int Rating { get; set; }
        public int CookTime { get; set; }
        public int PrepTime { get; set; }
        public int TotalTime => CookTime + PrepTime;

        public string? ImageUrl { get; set; }

        public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.Now;

        public int CategoryId { get; set; }
    }
}
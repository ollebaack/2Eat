using System.ComponentModel.DataAnnotations;
using System.Diagnostics.Metrics;

namespace _2Eat.Domain
{
    public class RecipeIngredient
    {
        [Key]
        public int Id { get; set; }
        public int Order { get; set; }
        public Measurement? Measurement { get; set; }

        public int RecipeId { get; set; }
        public Recipe Recipe { get; set; } = null!;

        public int IngredientId { get; set; }
        public Ingredient Ingredient { get; set; } = null!;
    }
}
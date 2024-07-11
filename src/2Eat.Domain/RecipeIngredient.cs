using System.ComponentModel.DataAnnotations;
using System.Diagnostics.Metrics;

namespace _2Eat.Domain
{
    public class RecipeIngredient
    {
        [Key]
        public int Id { get; set; }
        public int Order { get; set; }

        public int IngredientMeasurementId { get; set; }
        public IngredientMeasurement IngredientMeasurement { get; set; } = null!;


        public int RecipeId { get; set; }
        public Recipe Recipe { get; set; } = null!;

        public int IngredientId { get; set; }
        public Ingredient Ingredient { get; set; } = null!;
        public override string ToString()
        {
            string name = Ingredient.Name ?? throw new InvalidOperationException($"{nameof(Ingredient.Name)} was null.");
            string measurement = "";
            if (IngredientMeasurement != null)
            {
                measurement = $"{IngredientMeasurement.Quantity}{IngredientMeasurement.Unit} ";
            }

            return measurement + name;
        }
    }
}
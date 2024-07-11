using _2Eat.Domain.Enums;
using System.ComponentModel.DataAnnotations;
using System.Globalization;
using System.Xml.Linq;

namespace _2Eat.Domain
{
    public class Ingredient
    {
        [Key]
        public int Id { get; set; }

        private string name = string.Empty;
        [Required(ErrorMessage = "Please enter a name.")]
        [MaxLength(64)]
        public string Name
        {
            get => name;
            set => name = CultureInfo.CurrentCulture.TextInfo.ToTitleCase(value.ToLower());
        }
        public Category Category { get; set; } = null!;
        public ICollection<Allergen> Allergens { get; set; } = new List<Allergen>();
        public ICollection<RecipeIngredient> Recipes { get; set; } = new List<RecipeIngredient>();

        public int CategoryId { get; set; }
    }
}
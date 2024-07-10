using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace _2Eat.Domain
{
    public class Category
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(64)]
        public string Name { get; set; } = null!;

        public ICollection<Recipe> Recipes { get; set; } = new List<Recipe>();
        public ICollection<Ingredient> Ingredients { get; set; } = new List<Ingredient>();
    }
}

using System.ComponentModel.DataAnnotations;

namespace _2Eat.Domain
{
    public class Allergens
    {
        [Key]
        public int Id { get; set; }
        public string Name { get; set; } = null!;
    }
}
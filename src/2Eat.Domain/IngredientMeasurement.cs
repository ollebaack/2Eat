using _2Eat.Domain.Enums;
using System.ComponentModel.DataAnnotations;

namespace _2Eat.Domain
{
    public class IngredientMeasurement
    {
        [Key]
        public int Id { get; set; }
        public double Quantity { get; set; }
        public UnitOfMeasurement Unit { get; set; }
    }
}
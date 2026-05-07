using System.ComponentModel.DataAnnotations;

namespace _2Eat.Domain
{
    public class PantryItem
    {
        [Key]
        public int Id { get; set; }
        public int UserId { get; set; }
        public string Name { get; set; } = null!;
        public string Category { get; set; } = string.Empty;
        public double Quantity { get; set; }
        public string Unit { get; set; } = string.Empty;
        public DateOnly? ExpiresAt { get; set; }
        public bool IsOpened { get; set; }
        public bool IsLow { get; set; }
    }
}

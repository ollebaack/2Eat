using System.ComponentModel.DataAnnotations;

namespace _2Eat.Domain
{
    public class Measurement
    {
        [Key]
        public int Id { get; set; }
        public string Name { get; set; } = null!;
    }
}
using System.ComponentModel.DataAnnotations;

namespace _2Eat.Domain
{
    public class User
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [EmailAddress]
        public string Email { get; set; } = null!;

        [Required]
        [MaxLength(64)]
        public string DisplayName { get; set; } = null!;

        [Required]
        public string PasswordHash { get; set; } = null!;

        [MaxLength(200)]
        public string? AvatarUrl { get; set; }

        public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

        public int? ShoppingListId { get; set; }
        public ShoppingList? ShoppingList { get; set; }
    }
}

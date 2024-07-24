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
        public string Instructions { get; set; } = string.Empty;
        public string? ImageUrl { get; set; }

        public Category Category { get; set; } = null!;
        public ICollection<RecipeIngredient> Ingredients { get; set; } = new List<RecipeIngredient>();
        public int Servings { get; set; }
        public int Rating { get; set; }
        public int CookTime { get; set; }
        public int PrepTime { get; set; }
        public int TotalTime => CookTime + PrepTime;
        public DateTimeOffset LastModified { get; set; } = DateTimeOffset.Now;
        public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.Now;
        public int CategoryId { get; set; }
        public string GetLastModifiedTimeAgo()
        {
            TimeSpan timeSinceModified = DateTimeOffset.Now - LastModified;
            string timeAgo;

            switch (timeSinceModified.TotalMinutes)
            {
                case < 1:
                    timeAgo = "modified just now";
                    break;
                case < 60:
                    timeAgo = $"modified {timeSinceModified.TotalMinutes:0} min ago";
                    break;
                case < 1440:
                    timeAgo = $"modified {timeSinceModified.TotalHours:0} hours ago";
                    break;
                default:
                    timeAgo = $"modified on {LastModified.ToString("yyyy-MM-dd")}";
                    break;
            }

            return timeAgo;
        }
    }
}
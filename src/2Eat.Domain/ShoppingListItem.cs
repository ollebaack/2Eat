using System.ComponentModel.DataAnnotations;

namespace _2Eat.Domain
{
    public class ShoppingListItem
    {
        [Key]
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public bool IsChecked { get; set; }
        public ShoppingList ShoppingList { get; set; } = null!;

        public int ShoppingListId { get; set; }
    }
}
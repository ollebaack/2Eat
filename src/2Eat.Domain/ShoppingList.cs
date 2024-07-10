using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace _2Eat.Domain
{
    public class ShoppingList
    {
        [Key]
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public User User { get; set; } = null!;
        public ICollection<ShoppingListItem> Items { get; set; } = new List<ShoppingListItem>();

        public int UserId { get; set; }
    }
}

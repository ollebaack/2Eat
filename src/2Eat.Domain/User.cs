using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace _2Eat.Domain
{
    public class User
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public ICollection<Recipe> Receipies { get; set; }
    }
}

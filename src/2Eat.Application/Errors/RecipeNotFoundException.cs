using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace _2Eat.Application.Errors
{
    public class RecipeNotFoundException : Exception
    {
        public RecipeNotFoundException(int recipeId)
            : base($"Recipe with ID {recipeId} not found") { }
    }
}

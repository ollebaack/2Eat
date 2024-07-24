using _2Eat.Domain;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace _2Eat.Infrastructure.Services.RecipeServices
{
    public interface IRecipeService
    {
        Task<List<Recipe>> GetRecipesAsync();
        Task<List<Recipe>> GetRandomRecipesAsync(int count);
        Task<Recipe?> GetRecipeByIdAsync(int id);
        Task<Recipe> AddRecipeAsync(Recipe recipe);
        Task<Recipe> UpdateRecipeAsync(int Id, Recipe recipe);
        Task<Recipe> DeleteRecipeAsync(int id);
    }
}

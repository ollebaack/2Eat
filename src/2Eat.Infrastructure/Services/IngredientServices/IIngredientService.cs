using _2Eat.Domain;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace _2Eat.Infrastructure.Services.IngredientServices
{
    public interface IIngredientService
    {
        Task<List<Ingredient>> GetIngredientsAsync();
        Task<Ingredient?> GetIngredientByIdAsync(int id);
        Task<Ingredient> AddIngredientAsync(Ingredient ingredient);
        //Task<Recipe> UpdateRecipeAsync(int Id, Recipe recipe);
        Task<Ingredient> DeleteIngredientAsync(int id);
    }
}

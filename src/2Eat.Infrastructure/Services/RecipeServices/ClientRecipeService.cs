using _2Eat.Domain;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http.Json;
using System.Text;
using System.Threading.Tasks;

namespace _2Eat.Infrastructure.Services.RecipeServices
{
    public class ClientRecipeService : IRecipeService
    {
        private readonly HttpClient _httpClient;

        public ClientRecipeService(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        public async Task<List<Recipe>> GetRecipesAsync()
        {
            List<Recipe>? recipes = null;
            // Assuming the external API endpoint for fetching all recipes is "/api/recipes"

            var result = await _httpClient.GetAsync("/api/recipes");
            //.GetFromJsonAsync<List<Recipe>>("/api/recipes")
            if (result.IsSuccessStatusCode)
            {
                recipes = await result.Content.ReadFromJsonAsync<List<Recipe>>();
            }

            return recipes ?? new List<Recipe>();
        }

        public async Task<Recipe> GetRecipeByIdAsync(int id)
        {
            // Assuming the external API endpoint for fetching a recipe by ID is "/api/recipes/{id}"
            var recipe = await _httpClient.GetFromJsonAsync<Recipe>($"/api/recipes/{id}");
            return recipe;
        }

        public async Task<Recipe> AddRecipeAsync(Recipe recipe)
        {
            // Implement the POST request to add a new recipe
            var response = await _httpClient.PostAsJsonAsync("/api/recipes", recipe);
            if (response.IsSuccessStatusCode)
            {
                return await response.Content.ReadFromJsonAsync<Recipe>();
            }
            return null;
        }

        public async Task<Recipe> UpdateRecipeAsync(int id, Recipe recipe)
        {
            // Implement the PUT request to update an existing recipe
            var response = await _httpClient.PutAsJsonAsync($"/api/recipes/{id}", recipe);
            if (response.IsSuccessStatusCode)
            {
                return await response.Content.ReadFromJsonAsync<Recipe>();
            }
            return null;
        }

        public async Task<Recipe> DeleteRecipeAsync(int id)
        {
            // Implement the DELETE request to delete a recipe
            var response = await _httpClient.DeleteAsync($"/api/recipes/{id}");
            if (response.IsSuccessStatusCode)
            {
                return await response.Content.ReadFromJsonAsync<Recipe>();
            }
            return null;
        }
    }
}

using _2Eat.Domain;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json.Serialization;
using System.Text.Json;
using System.Threading.Tasks;
using _2Eat.Application.Json;

namespace _2Eat.Infrastructure.Services.RecipeServices
{
    public class ClientRecipeService(HttpClient httpClient) : IRecipeService
    {
        private readonly HttpClient _httpClient = httpClient;

        public async Task<List<Recipe>?> GetRecipesAsync()
        {
            var response = await _httpClient.GetAsync("/api/recipes");
            if (response.IsSuccessStatusCode)
            {
                return await response.Content.ReadFromJsonAsync<List<Recipe>>(JsonHandler.JsonSerializerOptions);
            }

            return null;
        }

        public async Task<Recipe?> GetRecipeByIdAsync(int id) 
            => await _httpClient.GetFromJsonAsync<Recipe>($"/api/recipes/{id}", JsonHandler.JsonSerializerOptions);

        public async Task<Recipe?> AddRecipeAsync(Recipe recipe)
        {
            var response = await _httpClient.PostAsJsonAsync("/api/recipes", recipe, JsonHandler.JsonSerializerOptions);

            if (response.IsSuccessStatusCode)
            {
                return await response.Content.ReadFromJsonAsync<Recipe>(JsonHandler.JsonSerializerOptions);
            }
            
            throw new Exception($"Failed to add recipe. Reason: {response.ReasonPhrase}");
        }

        public async Task<Recipe?> UpdateRecipeAsync(int id, Recipe recipe)
        {
            // Implement the PUT request to update an existing recipe
            var response = await _httpClient.PutAsJsonAsync($"/api/recipes/{id}", recipe, JsonHandler.JsonSerializerOptions);
            if (response.IsSuccessStatusCode)
            {
                return await response.Content.ReadFromJsonAsync<Recipe>(JsonHandler.JsonSerializerOptions);
            }
            return null;
        }

        public async Task<Recipe?> DeleteRecipeAsync(int id)
        {
            // Implement the DELETE request to delete a recipe
            var response = await _httpClient.DeleteAsync($"/api/recipes/{id}");
            if (response.IsSuccessStatusCode)
            {
                return await response.Content.ReadFromJsonAsync<Recipe>(JsonHandler.JsonSerializerOptions);
            }
            return null;
        }
    }
}

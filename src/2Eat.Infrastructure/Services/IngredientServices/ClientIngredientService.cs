using _2Eat.Domain;
using System.Net.Http.Json;

namespace _2Eat.Infrastructure.Services.IngredientServices
{
    public class ClientIngredientService : IIngredientService
    {
        private readonly HttpClient _httpClient;

        public ClientIngredientService(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        public async Task<List<Ingredient>> GetIngredientsAsync()
        {
            List<Ingredient>? ingredients = null;
            // Assuming the external API endpoint for fetching all ingredients is "/api/ingredients"

            var result = await _httpClient.GetAsync("/api/ingredients");
            //.GetFromJsonAsync<List<Ingredient>>("/api/ingredients")
            if (result.IsSuccessStatusCode)
            {
                ingredients = await result.Content.ReadFromJsonAsync<List<Ingredient>>();
            }

            return ingredients ?? new List<Ingredient>();
        }

        public async Task<Ingredient> GetIngredientByIdAsync(int id)
        {
            // Assuming the external API endpoint for fetching a ingredient by ID is "/api/ingredients/{id}"
            var ingredient = await _httpClient.GetFromJsonAsync<Ingredient>($"/api/ingredients/{id}");
            return ingredient;
        }

        public async Task<Ingredient?> AddIngredientAsync(Ingredient ingredient)
        {
            // Implement the POST request to add a new ingredient
            var response = await _httpClient.PostAsJsonAsync("/api/ingredients", ingredient);
            if (response.IsSuccessStatusCode)
            {
                return await response.Content.ReadFromJsonAsync<Ingredient>();
            }
            return null;
        }

        public async Task<Ingredient?> DeleteIngredientAsync(int id)
        {
            // Implement the DELETE request to delete a ingredient
            var response = await _httpClient.DeleteAsync($"/api/ingredients/{id}");
            if (response.IsSuccessStatusCode)
            {
                return await response.Content.ReadFromJsonAsync<Ingredient>();
            }
            return null;
        }
    }
}

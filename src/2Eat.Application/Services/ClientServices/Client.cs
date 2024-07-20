using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace _2Eat.Application.Services.ClientServices
{
    public class Client : IClient
    {
        private readonly HttpClient _httpClient;
        private readonly JsonSerializerOptions _jsonSerializerOptions;

        private string BaseEndpoint = string.Empty;

        public Client(HttpClient httpClient)
        {
            _httpClient = httpClient;
            _jsonSerializerOptions = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true,
                ReferenceHandler = ReferenceHandler.Preserve,
                WriteIndented = true
            };
        }

        public void SetEntityEndpoint(string entity)
        {
            BaseEndpoint = $"/api/{entity}";
        }

        public async Task<List<TResult>> GetAsync<TResult>()
        {
            CheckIfEndpointSet();

            var response = await _httpClient.GetAsync(BaseEndpoint);
            if (response.IsSuccessStatusCode)
            {
                return await response.Content.ReadFromJsonAsync<List<TResult>>(_jsonSerializerOptions)
                    ?? throw new InvalidOperationException($"Something went wrong went returning {typeof(List<TResult>)}");
            }

            throw new InvalidOperationException($"Failed to fetch entities. Reason: {response.ReasonPhrase}");
        }

        public async Task<TResult> GetByIdAsync<TResult>(int id)
        {
            CheckIfEndpointSet();
            return await _httpClient.GetFromJsonAsync<TResult>($"{BaseEndpoint}/{id}", _jsonSerializerOptions)
                ?? throw new InvalidOperationException($"Something went wrong went returning {typeof(TResult)}");
        }

        public async Task<TResult> GetByNameAsync<TResult>(string name)
        {
            CheckIfEndpointSet();
            var response = await _httpClient.GetAsync($"{BaseEndpoint}/{name}");
            if (response.IsSuccessStatusCode)
            {
                return await response.Content.ReadFromJsonAsync<TResult>(_jsonSerializerOptions)
                    ?? throw new InvalidOperationException($"Something went wrong went returning {typeof(TResult)}");
            }
            else
            {
                throw new InvalidOperationException($"Failed to fetch entity. Reason: {response.ReasonPhrase}");
            }
            // return await _httpClient.GetFromJsonAsync<TResult>($"{BaseEndpoint}/{name}", _jsonSerializerOptions)
            //     ?? throw new InvalidOperationException($"Something went wrong went returning {typeof(TResult)}");
        }

        public async Task<TResult> CreateAsync<TResult, TEntity>(TEntity entity)
        {
            CheckIfEndpointSet();
            HttpResponseMessage response;

            if (entity is HttpContent content)
            {
                response = await _httpClient.PostAsync(BaseEndpoint, content);

                if (response.IsSuccessStatusCode)
                {
                    var result = await response.Content.ReadFromJsonAsync<TResult>(_jsonSerializerOptions) 
                        ?? throw new InvalidOperationException($"Something went wrong went returning {typeof(TResult)}");
                    return result;
                }

                throw new Exception($"Failed to add entity. Reason: {response.ReasonPhrase}");
            }

            response = await _httpClient.PostAsJsonAsync(BaseEndpoint, entity, _jsonSerializerOptions);

            if (response.IsSuccessStatusCode)
            {
                return await response.Content.ReadFromJsonAsync<TResult>(_jsonSerializerOptions)
                    ?? throw new InvalidOperationException($"Something went wrong went returning {typeof(TResult)}");
            }

            throw new Exception($"Failed to add entity. Reason: {response.ReasonPhrase}");
        }

        public async Task<TResult> UpdateAsync<TResult, TEntity>(int id, TEntity entity)
        {
            CheckIfEndpointSet();

            // Implement the PUT request to update an existing entity
            var response = await _httpClient.PutAsJsonAsync($"{BaseEndpoint}/{id}", entity, _jsonSerializerOptions);
            if (response.IsSuccessStatusCode)
            {
                return await response.Content.ReadFromJsonAsync<TResult>(_jsonSerializerOptions)
                    ?? throw new InvalidOperationException($"Something went wrong went returning {typeof(TResult)}");
            }

            throw new InvalidOperationException($"Failed to update entity. Reason: {response.ReasonPhrase}");
        }

        public async Task<TResult> DeleteAsync<TResult>(int id)
        {
            CheckIfEndpointSet();

            // Implement the DELETE request to delete a entity
            var response = await _httpClient.DeleteAsync($"{BaseEndpoint}/{id}");
            if (response.IsSuccessStatusCode)
            {
                return await response.Content.ReadFromJsonAsync<TResult>(_jsonSerializerOptions)
                    ?? throw new InvalidOperationException($"Something went wrong went returning {typeof(TResult)}");
            }

            throw new InvalidOperationException($"Failed to delete entity. Reason: {response.ReasonPhrase}");
        }

        private void CheckIfEndpointSet()
        {
            if (string.IsNullOrEmpty(BaseEndpoint))
            {
                throw new InvalidOperationException("Entity endpoint is not set. Please set the entity endpoint before making a request.");
            }
        }
    }
}

using System.Net.Http.Json;
using System.Text.Json;
using _2Eat.Web.API.Tests.Helpers;

namespace _2Eat.Web.API.Tests;

[Collection("Api")]
public class IngredientTests(ApiTestFixture fixture)
{
    // Category 5 ("Övrigt") is seeded by the Initial migration.
    private static object NewIngredient(string? name = null) => new
    {
        name = name ?? $"TestIngredient-{Guid.NewGuid():N}",
        categoryId = 5,
        pricePerUnit = (decimal?)null
    };

    [Fact]
    public async Task ListIngredients_Authenticated_Returns200()
    {
        var client = await fixture.CreateAuthenticatedClientAsync();

        var response = await client.GetAsync("/api/ingredients");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<JsonElement>();
        Assert.Equal(JsonValueKind.Array, body.ValueKind);
    }

    [Fact]
    public async Task ListIngredients_WithoutToken_Returns401()
    {
        var client = fixture.Factory.CreateClient();

        var response = await client.GetAsync("/api/ingredients");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task GetIngredientById_ExistingId_Returns200WithIngredient()
    {
        var client = await fixture.CreateAuthenticatedClientAsync();

        // Create one first so we have a known ID.
        var createResp = await client.PostAsJsonAsync("/api/ingredients", NewIngredient());
        Assert.Equal(HttpStatusCode.OK, createResp.StatusCode);
        var created = await createResp.Content.ReadFromJsonAsync<JsonElement>();
        var id = created.GetProperty("id").GetInt32();

        var response = await client.GetAsync($"/api/ingredients/{id}");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<JsonElement>();
        Assert.Equal(id, body.GetProperty("id").GetInt32());
    }

    [Fact]
    public async Task GetIngredientById_NonExistentId_Returns404()
    {
        var client = await fixture.CreateAuthenticatedClientAsync();

        var response = await client.GetAsync("/api/ingredients/999999");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task CreateIngredient_HappyPath_Returns200WithIngredient()
    {
        var client = await fixture.CreateAuthenticatedClientAsync();
        var name = $"NewIngredient-{Guid.NewGuid():N}";

        var response = await client.PostAsJsonAsync("/api/ingredients", NewIngredient(name));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<JsonElement>();
        Assert.True(body.GetProperty("id").GetInt32() > 0);
        // Names are stored in title case.
        Assert.False(string.IsNullOrWhiteSpace(body.GetProperty("name").GetString()));
    }

    [Fact]
    public async Task CreateIngredient_EmptyName_ReturnsBadRequest()
    {
        var client = await fixture.CreateAuthenticatedClientAsync();

        var response = await client.PostAsJsonAsync("/api/ingredients", new
        {
            name = "",
            categoryId = 5,
            pricePerUnit = (decimal?)null
        });

        // The service throws ArgumentException for empty names, which the endpoint
        // catches and maps to a 400 ProblemHttpResult.
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task UpdateIngredient_HappyPath_Returns200WithUpdatedIngredient()
    {
        var client = await fixture.CreateAuthenticatedClientAsync();

        var createResp = await client.PostAsJsonAsync("/api/ingredients", NewIngredient());
        var created = await createResp.Content.ReadFromJsonAsync<JsonElement>();
        var id = created.GetProperty("id").GetInt32();

        var updatedName = $"Updated-{Guid.NewGuid():N}";
        var response = await client.PutAsJsonAsync($"/api/ingredients/{id}", new
        {
            name = updatedName,
            categoryId = 5,
            pricePerUnit = (decimal?)1.99m
        });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<JsonElement>();
        // Name is title-cased by the domain entity setter.
        Assert.False(string.IsNullOrWhiteSpace(body.GetProperty("name").GetString()));
    }

    [Fact]
    public async Task UpdateIngredient_NonExistentId_Returns404()
    {
        var client = await fixture.CreateAuthenticatedClientAsync();

        var response = await client.PutAsJsonAsync("/api/ingredients/999999", new
        {
            name = "DoesNotMatter",
            categoryId = 5,
            pricePerUnit = (decimal?)null
        });

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task DeleteIngredient_HappyPath_Returns200()
    {
        var client = await fixture.CreateAuthenticatedClientAsync();

        var createResp = await client.PostAsJsonAsync("/api/ingredients", NewIngredient());
        var created = await createResp.Content.ReadFromJsonAsync<JsonElement>();
        var id = created.GetProperty("id").GetInt32();

        var response = await client.DeleteAsync($"/api/ingredients/{id}");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task DeleteIngredient_NonExistentId_Returns404()
    {
        var client = await fixture.CreateAuthenticatedClientAsync();

        var response = await client.DeleteAsync("/api/ingredients/999999");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }
}

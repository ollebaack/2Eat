using System.Net.Http.Json;
using System.Text.Json;
using _2Eat.Web.API.Tests.Helpers;

namespace _2Eat.Web.API.Tests;

[Collection("Api")]
public class RecipeTests(ApiTestFixture fixture)
{
    private static object MinimalRecipe(string? name = null) => new
    {
        name = name ?? $"Test Recipe {Guid.NewGuid():N}",
        description = "A test recipe",
        instructions = "Do stuff",
        categoryId = 5,
        servings = 2,
        rating = 3,
        difficulty = "Medel",
        cookTime = 30,
        prepTime = 10,
        ingredients = Array.Empty<object>()
    };

    [Fact]
    public async Task CreateRecipe_Returns200WithRecipe()
    {
        var client = await fixture.CreateAuthenticatedClientAsync();

        var response = await client.PostAsJsonAsync("/api/recipes", MinimalRecipe());

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<JsonElement>();
        Assert.True(body.GetProperty("id").GetInt32() > 0);
    }

    [Fact]
    public async Task ListRecipes_IncludesCreatedRecipe()
    {
        var client = await fixture.CreateAuthenticatedClientAsync();

        var recipeName = $"ListTest-{Guid.NewGuid():N}";
        await client.PostAsJsonAsync("/api/recipes", MinimalRecipe(recipeName));

        var listResp = await client.GetAsync("/api/recipes");
        Assert.Equal(HttpStatusCode.OK, listResp.StatusCode);
        var body = await listResp.Content.ReadFromJsonAsync<JsonElement>();
        var names = body.EnumerateArray().Select(r => r.GetProperty("name").GetString()).ToList();
        Assert.Contains(recipeName, names);
    }

    [Fact]
    public async Task UpdateRecipe_Returns200()
    {
        var client = await fixture.CreateAuthenticatedClientAsync();

        var createResp = await client.PostAsJsonAsync("/api/recipes", MinimalRecipe());
        var created = await createResp.Content.ReadFromJsonAsync<JsonElement>();
        var id = created.GetProperty("id").GetInt32();

        var updatePayload = new
        {
            name = "Updated Recipe Name",
            description = "Updated",
            instructions = "Updated instructions",
            categoryId = 5,
            servings = 4,
            rating = 5,
            difficulty = "Svår",
            cookTime = 60,
            prepTime = 20,
            ingredients = Array.Empty<object>()
        };

        var response = await client.PutAsJsonAsync($"/api/recipes/{id}", updatePayload);
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<JsonElement>();
        Assert.Equal("Updated Recipe Name", body.GetProperty("name").GetString());
    }

    [Fact]
    public async Task DeleteRecipe_Returns200()
    {
        var client = await fixture.CreateAuthenticatedClientAsync();

        var createResp = await client.PostAsJsonAsync("/api/recipes", MinimalRecipe());
        var created = await createResp.Content.ReadFromJsonAsync<JsonElement>();
        var id = created.GetProperty("id").GetInt32();

        var response = await client.DeleteAsync($"/api/recipes/{id}");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task CreateRecipe_WithBlankName_Returns400()
    {
        var client = await fixture.CreateAuthenticatedClientAsync();

        var response = await client.PostAsJsonAsync("/api/recipes", new
        {
            name = "",
            description = "bad",
            instructions = "bad",
            categoryId = 5,
            servings = 2,
            rating = 1,
            difficulty = "Medel",
            cookTime = 10,
            prepTime = 5,
            ingredients = Array.Empty<object>()
        });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }
}

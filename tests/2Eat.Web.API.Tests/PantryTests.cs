using System.Net.Http.Json;
using System.Text.Json;
using _2Eat.Web.API.Tests.Helpers;

namespace _2Eat.Web.API.Tests;

[Collection("Api")]
public class PantryTests(ApiTestFixture fixture)
{
    private static object NewItem(string? name = null) => new
    {
        name = name ?? $"Item-{Guid.NewGuid():N}",
        category = "Test",
        quantity = 1.0,
        unit = "st",
        isOpened = false,
        isLow = false
    };

    [Fact]
    public async Task AddPantryItem_Returns200WithItem()
    {
        var client = await fixture.CreateAuthenticatedClientAsync();

        var response = await client.PostAsJsonAsync("/api/pantry", NewItem());

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<JsonElement>();
        Assert.True(body.GetProperty("id").GetInt32() > 0);
    }

    [Fact]
    public async Task UpdatePantryItem_Returns200()
    {
        var client = await fixture.CreateAuthenticatedClientAsync();

        var createResp = await client.PostAsJsonAsync("/api/pantry", NewItem("Flour"));
        var created = await createResp.Content.ReadFromJsonAsync<JsonElement>();
        var id = created.GetProperty("id").GetInt32();

        var response = await client.PutAsJsonAsync($"/api/pantry/{id}", new
        {
            name = "Flour Updated",
            category = "Baking",
            quantity = 2.0,
            unit = "kg",
            isOpened = true,
            isLow = false
        });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<JsonElement>();
        Assert.Equal("Flour Updated", body.GetProperty("name").GetString());
    }

    [Fact]
    public async Task DeletePantryItem_Returns204()
    {
        var client = await fixture.CreateAuthenticatedClientAsync();

        var createResp = await client.PostAsJsonAsync("/api/pantry", NewItem());
        var created = await createResp.Content.ReadFromJsonAsync<JsonElement>();
        var id = created.GetProperty("id").GetInt32();

        var response = await client.DeleteAsync($"/api/pantry/{id}");
        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
    }

    [Fact]
    public async Task PantryItems_AreUserScoped_UserBCannotSeeUserAItems()
    {
        var clientA = fixture.Factory.CreateClient();
        var clientB = fixture.Factory.CreateClient();
        await Task.WhenAll(
            AuthHelper.AuthenticateClientAsync(clientA),
            AuthHelper.AuthenticateClientAsync(clientB));

        var uniqueName = $"ScopedItem-{Guid.NewGuid():N}";
        var createResp = await clientA.PostAsJsonAsync("/api/pantry", NewItem(uniqueName));
        var created = await createResp.Content.ReadFromJsonAsync<JsonElement>();
        var itemId = created.GetProperty("id").GetInt32();

        var listResp = await clientB.GetAsync("/api/pantry");
        Assert.Equal(HttpStatusCode.OK, listResp.StatusCode);
        var items = await listResp.Content.ReadFromJsonAsync<JsonElement>();
        var ids = items.EnumerateArray().Select(i => i.GetProperty("id").GetInt32()).ToList();
        Assert.DoesNotContain(itemId, ids);
    }
}

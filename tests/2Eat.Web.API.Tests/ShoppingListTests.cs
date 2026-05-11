using System.Net.Http.Json;
using System.Text.Json;
using _2Eat.Web.API.Tests.Helpers;

namespace _2Eat.Web.API.Tests;

[Collection("Api")]
public class ShoppingListTests(ApiTestFixture fixture)
{
    [Fact]
    public async Task AddItem_Returns200WithItem()
    {
        var client = await fixture.CreateAuthenticatedClientAsync();

        var response = await client.PostAsJsonAsync("/api/shopping-list/", new
        {
            name = "Mjölk",
            quantity = 2.0,
            unit = "liter"
        });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<JsonElement>();
        Assert.True(body.GetProperty("id").GetInt32() > 0);
    }

    [Fact]
    public async Task UpdateItem_MarksChecked_Returns200()
    {
        var client = await fixture.CreateAuthenticatedClientAsync();

        var createResp = await client.PostAsJsonAsync("/api/shopping-list/", new { name = "Ägg" });
        var created = await createResp.Content.ReadFromJsonAsync<JsonElement>();
        var id = created.GetProperty("id").GetInt32();

        var response = await client.PutAsJsonAsync($"/api/shopping-list/{id}", new { isChecked = true });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<JsonElement>();
        Assert.True(body.GetProperty("isChecked").GetBoolean());
    }

    [Fact]
    public async Task DeleteItem_Returns204()
    {
        var client = await fixture.CreateAuthenticatedClientAsync();

        var createResp = await client.PostAsJsonAsync("/api/shopping-list/", new { name = "Smör" });
        var created = await createResp.Content.ReadFromJsonAsync<JsonElement>();
        var id = created.GetProperty("id").GetInt32();

        var response = await client.DeleteAsync($"/api/shopping-list/{id}");
        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
    }
}

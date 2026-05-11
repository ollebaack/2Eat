using System.Net.Http.Json;
using System.Text.Json;
using _2Eat.Web.API.Tests.Helpers;

namespace _2Eat.Web.API.Tests;

[Collection("Api")]
public class AuthorizationTests(ApiTestFixture fixture)
{
    [Theory]
    [InlineData("GET", "/api/recipes")]
    [InlineData("GET", "/api/pantry")]
    [InlineData("GET", "/api/shopping-list/")]
    [InlineData("GET", "/api/mealplan/week/2026-01-05")]
    public async Task ProtectedEndpoints_WithoutToken_Return401(string method, string path)
    {
        var client = fixture.Factory.CreateClient();
        using var request = new HttpRequestMessage(new HttpMethod(method), path);
        var response = await client.SendAsync(request);
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Pantry_IsUserScoped_UserBCannotSeeUserAItems()
    {
        var clientA = fixture.Factory.CreateClient();
        var clientB = fixture.Factory.CreateClient();
        await Task.WhenAll(
            AuthHelper.AuthenticateClientAsync(clientA),
            AuthHelper.AuthenticateClientAsync(clientB));

        var createResp = await clientA.PostAsJsonAsync("/api/pantry", new
        {
            name = $"UniqueItem-{Guid.NewGuid():N}",
            category = "Test",
            quantity = 1.0,
            unit = "st"
        });
        Assert.Equal(HttpStatusCode.OK, createResp.StatusCode);
        var created = await createResp.Content.ReadFromJsonAsync<JsonElement>();
        var itemId = created.GetProperty("id").GetInt32();

        var listResp = await clientB.GetAsync("/api/pantry");
        Assert.Equal(HttpStatusCode.OK, listResp.StatusCode);
        var items = await listResp.Content.ReadFromJsonAsync<JsonElement>();
        var ids = items.EnumerateArray().Select(i => i.GetProperty("id").GetInt32()).ToList();
        Assert.DoesNotContain(itemId, ids);
    }
}

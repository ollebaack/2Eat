using System.Net.Http.Json;
using System.Text.Json;

namespace _2Eat.Web.API.Tests;

[Collection("Utforska")]
public class UtforskaTests(UtforskaFixture fixture)
{
    [Theory]
    [InlineData("GET", "/api/utforska")]
    [InlineData("POST", "/api/admin/forslag/refresh")]
    public async Task Endpoints_WithoutToken_Return401(string method, string path)
    {
        var client = fixture.Factory.CreateClient();
        using var request = new HttpRequestMessage(new HttpMethod(method), path);
        var response = await client.SendAsync(request);
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    /// <summary>
    /// Verifies the full Utforska flow: pool seeding, serving Förslag, and repeated refresh.
    ///
    /// The pool may already be seeded via the background refresh that fires on login
    /// (AuthEndpoints.TriggerForslagRefresh). Either way, GetNext must return items
    /// and a second immediate refresh must also succeed (no cooldown).
    /// </summary>
    [Fact]
    public async Task FullFlow_SeedPoolServeForslag_DoubleRefreshSucceeds()
    {
        var client = await fixture.CreateAuthenticatedClientAsync();

        // Seed the pool. Stub scraper returns 3 items.
        var seedResp = await client.PostAsync("/api/admin/forslag/refresh", null);
        Assert.Equal(HttpStatusCode.OK, seedResp.StatusCode);

        // Pool is seeded — GetNext must return items with correct shape.
        var getResp = await client.GetAsync("/api/utforska");
        Assert.Equal(HttpStatusCode.OK, getResp.StatusCode);

        var items = await getResp.Content.ReadFromJsonAsync<JsonElement>();
        Assert.Equal(JsonValueKind.Array, items.ValueKind);
        Assert.True(items.GetArrayLength() > 0, "Expected at least one Förslag after seeding");

        var first = items[0];
        Assert.True(first.GetProperty("id").GetInt32() > 0);
        Assert.False(string.IsNullOrEmpty(first.GetProperty("title").GetString()));
        Assert.False(string.IsNullOrEmpty(first.GetProperty("sourceUrl").GetString()));
        Assert.False(string.IsNullOrEmpty(first.GetProperty("sourceSite").GetString()));

        // A second immediate refresh must also succeed — no cooldown.
        var secondResp = await client.PostAsync("/api/admin/forslag/refresh", null);
        Assert.Equal(HttpStatusCode.OK, secondResp.StatusCode);
    }

    /// <summary>
    /// Verifies that GetNextAsync does not throw when it fires a background pool refresh
    /// mid-request. Before the fix, the fire-and-forget task called RefreshPoolAsync on
    /// the request-scoped ForslagService instance, whose DbContext had already been disposed
    /// when the request ended. The fix injects IServiceScopeFactory and creates a fresh scope
    /// for the background task.
    ///
    /// The trigger condition (unseenCount ≤ total/2) fires on the second call once the user
    /// has seen all items and the cursor has been reset. We verify no 500 surfaces.
    /// </summary>
    [Fact]
    public async Task GetNext_MultipleCalls_NeverReturns500()
    {
        // Use a fresh user so seen-state is clean. Pool is already seeded by FullFlow or login trigger.
        var client = await fixture.CreateAuthenticatedClientAsync();

        for (var i = 0; i < 3; i++)
        {
            var resp = await client.GetAsync("/api/utforska");
            Assert.Equal(HttpStatusCode.OK, resp.StatusCode);
        }
    }
}

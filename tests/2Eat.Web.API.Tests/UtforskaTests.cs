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
    /// Verifies the full Utforska flow: pool seeding, serving Förslag, and 30-minute cooldown.
    ///
    /// The pool may already be seeded via the background refresh that fires on login
    /// (AuthEndpoints.TriggerForslagRefresh). The test accounts for both cases:
    ///   - If the pool was empty: the explicit refresh returns 200 and seeds it.
    ///   - If already seeded: the explicit refresh returns 429; the pool is already usable.
    /// Either way, GetNext must return items and a second immediate refresh must be blocked.
    /// </summary>
    [Fact]
    public async Task FullFlow_SeedPoolServeForslag_CooldownBlocksDoubleRefresh()
    {
        var client = await fixture.CreateAuthenticatedClientAsync();

        // Seed the pool. Stub scraper returns 3 items. A 429 here means the background
        // trigger on login already seeded the pool — that is fine, proceed either way.
        var seedResp = await client.PostAsync("/api/admin/forslag/refresh", null);
        Assert.True(
            seedResp.StatusCode is HttpStatusCode.OK or HttpStatusCode.TooManyRequests,
            $"Unexpected status from refresh: {seedResp.StatusCode}");

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

        // A second immediate refresh must always be blocked by the 30-minute cooldown.
        var cooldownResp = await client.PostAsync("/api/admin/forslag/refresh", null);
        Assert.Equal(HttpStatusCode.TooManyRequests, cooldownResp.StatusCode);
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

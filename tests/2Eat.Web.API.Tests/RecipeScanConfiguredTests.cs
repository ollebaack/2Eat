using System.Net.Http.Json;
using System.Text.Json;

namespace _2Eat.Web.API.Tests;

[Collection("RecipeScan")]
public class RecipeScanConfiguredTests(RecipeScanFixture fixture)
{
    [Fact]
    public async Task GetScanStatus_WhenConfigured_ReturnsEnabled()
    {
        var client = await fixture.CreateAuthenticatedClientAsync();

        var response = await client.GetAsync("/api/recipes/scan/status");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<JsonElement>();
        Assert.True(body.GetProperty("enabled").GetBoolean());
    }

    [Theory]
    [InlineData("")]
    [InlineData("not-a-url")]
    [InlineData("relative/path")]
    public async Task ScanFromUrl_WithInvalidUrl_Returns400(string url)
    {
        var client = await fixture.CreateAuthenticatedClientAsync();

        var response = await client.PostAsJsonAsync("/api/recipes/scan/url", new { url });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    // ICA publishes JSON-LD structured data — the scraper extracts the recipe without
    // calling the Anthropic API, so this test passes with a fake key too.
    [Fact]
    public async Task ScanFromUrl_WithIcaRecipeUrl_ReturnsRecipe()
    {
        var client = await fixture.CreateAuthenticatedClientAsync();

        var response = await client.PostAsJsonAsync("/api/recipes/scan/url",
            new { url = "https://www.ica.se/recept/kladdig-kladdkaka-722982/" });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<JsonElement>();

        var name = body.GetProperty("name");
        Assert.NotEqual(JsonValueKind.Null, name.ValueKind);
        Assert.False(string.IsNullOrWhiteSpace(name.GetString()));

        var ingredients = body.GetProperty("ingredients");
        Assert.Equal(JsonValueKind.Array, ingredients.ValueKind);
        Assert.True(ingredients.GetArrayLength() > 0);
    }

    // Instagram uses OG meta tags + Claude — requires a real Anthropic API key.
    // Set ANTHROPIC_API_KEY to run this test locally or in CI.
    [SkippableFact]
    public async Task ScanFromUrl_WithInstagramUrl_ReturnsRecipe()
    {
        Skip.IfNot(RecipeScanFixture.HasRealAnthropicKey,
            "ANTHROPIC_API_KEY not set — skipping Instagram scan test");

        var client = await fixture.CreateAuthenticatedClientAsync();

        var response = await client.PostAsJsonAsync("/api/recipes/scan/url",
            new { url = "https://www.instagram.com/p/DQwViXVCFfE/" });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<JsonElement>();

        var name = body.GetProperty("name");
        Assert.NotEqual(JsonValueKind.Null, name.ValueKind);
        Assert.False(string.IsNullOrWhiteSpace(name.GetString()));
    }
}

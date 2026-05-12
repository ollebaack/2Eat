using System.Net.Http.Json;
using System.Text.Json;

namespace _2Eat.Web.API.Tests;

[Collection("Api")]
public class RecipeScanTests(ApiTestFixture fixture)
{
    [Theory]
    [InlineData("GET", "/api/recipes/scan/status")]
    [InlineData("POST", "/api/recipes/scan/url")]
    [InlineData("POST", "/api/recipes/scan/image")]
    public async Task ScanEndpoints_WithoutToken_Return401(string method, string path)
    {
        var client = fixture.Factory.CreateClient();
        using var request = new HttpRequestMessage(new HttpMethod(method), path);
        var response = await client.SendAsync(request);
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task GetScanStatus_WhenNotConfigured_ReturnsDisabled()
    {
        var client = await fixture.CreateAuthenticatedClientAsync();

        var response = await client.GetAsync("/api/recipes/scan/status");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<JsonElement>();
        Assert.False(body.GetProperty("enabled").GetBoolean());
    }

    [Fact]
    public async Task ScanFromUrl_WhenNotConfigured_Returns503()
    {
        var client = await fixture.CreateAuthenticatedClientAsync();

        var response = await client.PostAsJsonAsync("/api/recipes/scan/url",
            new { url = "https://www.ica.se/recept/kladdig-kladdkaka-722982/" });

        Assert.Equal(HttpStatusCode.ServiceUnavailable, response.StatusCode);
    }

    [Fact]
    public async Task ScanFromImage_WhenNotConfigured_Returns503()
    {
        var client = await fixture.CreateAuthenticatedClientAsync();

        using var content = new MultipartFormDataContent();
        using var imageContent = new ByteArrayContent([0xFF, 0xD8, 0xFF, 0xE0]);
        imageContent.Headers.ContentType = new("image/jpeg");
        content.Add(imageContent, "file", "test.jpg");

        var response = await client.PostAsync("/api/recipes/scan/image", content);

        Assert.Equal(HttpStatusCode.ServiceUnavailable, response.StatusCode);
    }
}

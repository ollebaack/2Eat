using System.Net.Http.Json;
using System.Text.Json;
using _2Eat.Web.API.Tests.Helpers;

namespace _2Eat.Web.API.Tests;

[Collection("Api")]
public class AuthTests(ApiTestFixture fixture)
{
    [Fact]
    public async Task Register_WithValidData_Returns201()
    {
        var client = fixture.Factory.CreateClient();
        var email = $"test-{Guid.NewGuid():N}@example.com";

        var response = await client.PostAsJsonAsync("/api/auth/register", new
        {
            email,
            password = "Test1234!",
            displayName = "Test User"
        });

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
    }

    [Fact]
    public async Task Register_DuplicateEmail_Returns409()
    {
        var client = fixture.Factory.CreateClient();
        var email = $"test-{Guid.NewGuid():N}@example.com";
        var payload = new { email, password = "Test1234!", displayName = "Test User" };

        await client.PostAsJsonAsync("/api/auth/register", payload);
        var response = await client.PostAsJsonAsync("/api/auth/register", payload);

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    [Fact]
    public async Task Login_WithValidCredentials_Returns200WithToken()
    {
        var client = fixture.Factory.CreateClient();
        var email = $"test-{Guid.NewGuid():N}@example.com";
        const string password = "Test1234!";

        await client.PostAsJsonAsync("/api/auth/register", new { email, password, displayName = "Test User" });

        var response = await client.PostAsJsonAsync("/api/auth/login", new { email, password });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<JsonElement>();
        var token = body.GetProperty("token").GetString();
        Assert.False(string.IsNullOrEmpty(token));
    }

    [Fact]
    public async Task Login_WithWrongPassword_Returns401()
    {
        var client = fixture.Factory.CreateClient();
        var email = $"test-{Guid.NewGuid():N}@example.com";

        await client.PostAsJsonAsync("/api/auth/register", new { email, password = "Test1234!", displayName = "Test User" });

        var response = await client.PostAsJsonAsync("/api/auth/login", new { email, password = "WrongPassword!" });

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task GetMe_WithoutToken_Returns401()
    {
        var client = fixture.Factory.CreateClient();
        var response = await client.GetAsync("/api/auth/me");
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task GetMe_WithValidToken_Returns200()
    {
        var client = await fixture.CreateAuthenticatedClientAsync();

        var response = await client.GetAsync("/api/auth/me");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }
}

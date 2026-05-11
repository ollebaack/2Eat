using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;

namespace _2Eat.Web.API.Tests.Helpers;

public static class AuthHelper
{
    public static async Task<string> RegisterAndLoginAsync(
        HttpClient client,
        string? email = null,
        string password = "Test1234!")
    {
        email ??= $"test-{Guid.NewGuid():N}@example.com";

        await client.PostAsJsonAsync("/api/auth/register", new
        {
            email,
            password,
            displayName = "Test User"
        });

        var loginResp = await client.PostAsJsonAsync("/api/auth/login", new
        {
            email,
            password
        });

        loginResp.EnsureSuccessStatusCode();
        var body = await loginResp.Content.ReadFromJsonAsync<JsonElement>();
        return body.GetProperty("token").GetString()!;
    }

    public static void SetBearerToken(this HttpClient client, string token) =>
        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", token);

    /// <summary>Registers a fresh user and sets the bearer token on <paramref name="client"/> in-place.</summary>
    public static async Task AuthenticateClientAsync(HttpClient client, string? email = null, string password = "Test1234!")
    {
        var token = await RegisterAndLoginAsync(client, email, password);
        client.SetBearerToken(token);
    }
}

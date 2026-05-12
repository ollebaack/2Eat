using System.Text;
using _2Eat.Web.API.Tests.Helpers;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using Testcontainers.PostgreSql;

namespace _2Eat.Web.API.Tests;

[CollectionDefinition("RecipeScan")]
public class RecipeScanCollection : ICollectionFixture<RecipeScanFixture> { }

/// <summary>
/// Like ApiTestFixture but with Anthropic:ApiKey injected so IsConfigured = true.
/// Uses a fake key by default; JSON-LD scraping (e.g. ICA) works without a real key.
/// Set ANTHROPIC_API_KEY to run AI-path tests (e.g. Instagram).
/// </summary>
public class RecipeScanFixture : IAsyncLifetime
{
    private readonly PostgreSqlContainer _postgres = new PostgreSqlBuilder()
        .WithImage("postgres:17-alpine")
        .Build();

    public WebApplicationFactory<Program> Factory { get; private set; } = null!;

    // Real API key if set (and non-empty); otherwise a placeholder that lets JSON-LD-based
    // tests pass without ever reaching the Anthropic API.
    // Note: use IsNullOrWhiteSpace instead of ?? so that an empty ANTHROPIC_API_KEY env
    // var doesn't silently suppress the fallback key.
    public static string AnthropicApiKey { get; } =
        string.IsNullOrWhiteSpace(Environment.GetEnvironmentVariable("ANTHROPIC_API_KEY"))
            ? "fake-key-for-json-ld-tests"
            : Environment.GetEnvironmentVariable("ANTHROPIC_API_KEY")!;

    public static bool HasRealAnthropicKey =>
        AnthropicApiKey != "fake-key-for-json-ld-tests";

    public async Task InitializeAsync()
    {
        await _postgres.StartAsync();

        Factory = new WebApplicationFactory<Program>()
            .WithWebHostBuilder(builder =>
            {
                builder.ConfigureAppConfiguration((_, config) =>
                    config.AddInMemoryCollection(new Dictionary<string, string?>
                    {
                        ["ConnectionStrings:twoeat"] = _postgres.GetConnectionString(),
                        ["Jwt:Secret"] = ApiTestFixture.TestJwtSecret,
                        ["Jwt:Issuer"] = ApiTestFixture.TestJwtIssuer,
                        ["Jwt:Audience"] = ApiTestFixture.TestJwtAudience,
                        ["Jwt:ExpiresInMinutes"] = "60",
                        ["Anthropic:ApiKey"] = AnthropicApiKey,
                    }));

                builder.ConfigureTestServices(services =>
                    services.PostConfigure<JwtBearerOptions>(
                        JwtBearerDefaults.AuthenticationScheme, opts =>
                        {
                            var key = new SymmetricSecurityKey(
                                Encoding.UTF8.GetBytes(ApiTestFixture.TestJwtSecret));
                            opts.TokenValidationParameters.IssuerSigningKey = key;
                            opts.TokenValidationParameters.ValidIssuer = ApiTestFixture.TestJwtIssuer;
                            opts.TokenValidationParameters.ValidAudience = ApiTestFixture.TestJwtAudience;
                        }));
            });

        _ = Factory.CreateClient();
    }

    public async Task DisposeAsync()
    {
        Factory.Dispose();
        await _postgres.DisposeAsync();
    }

    public async Task<HttpClient> CreateAuthenticatedClientAsync()
    {
        var client = Factory.CreateClient();
        await AuthHelper.AuthenticateClientAsync(client);
        return client;
    }
}

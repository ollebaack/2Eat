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

[CollectionDefinition("Api")]
public class ApiCollection : ICollectionFixture<ApiTestFixture> { }

public class ApiTestFixture : IAsyncLifetime
{
    // Use the same secret that appsettings.Development.json supplies so the
    // captured jwtSecret in Program.cs (read before our ConfigureAppConfiguration
    // callback fires) matches what IConfiguration exposes at request time.
    public const string TestJwtSecret = "dev-only-secret-key-must-be-at-least-32-chars!";
    public const string TestJwtIssuer = "2eat-api";
    public const string TestJwtAudience = "2eat-app";

    private readonly PostgreSqlContainer _postgres = new PostgreSqlBuilder()
        .WithImage("postgres:17-alpine")
        .Build();

    public WebApplicationFactory<Program> Factory { get; private set; } = null!;

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
                        ["Jwt:Secret"] = TestJwtSecret,
                        ["Jwt:Issuer"] = TestJwtIssuer,
                        ["Jwt:Audience"] = TestJwtAudience,
                        ["Jwt:ExpiresInMinutes"] = "60"
                    }));

                // Guarantee that the JWT bearer validation key matches what we put in
                // IConfiguration, regardless of when Program.cs captured the value.
                builder.ConfigureTestServices(services =>
                    services.PostConfigure<JwtBearerOptions>(
                        JwtBearerDefaults.AuthenticationScheme, options =>
                        {
                            var key = new SymmetricSecurityKey(
                                Encoding.UTF8.GetBytes(TestJwtSecret));
                            options.TokenValidationParameters.IssuerSigningKey = key;
                            options.TokenValidationParameters.ValidIssuer = TestJwtIssuer;
                            options.TokenValidationParameters.ValidAudience = TestJwtAudience;
                        }));
            });

        // Trigger startup (applies EF Core migrations via ApplyMigrations())
        _ = Factory.CreateClient();
    }

    public async Task DisposeAsync()
    {
        Factory.Dispose();
        await _postgres.DisposeAsync();
    }

    /// <summary>Creates a fresh HttpClient already authenticated as a new unique user.</summary>
    public async Task<HttpClient> CreateAuthenticatedClientAsync()
    {
        var client = Factory.CreateClient();
        await AuthHelper.AuthenticateClientAsync(client);
        return client;
    }
}

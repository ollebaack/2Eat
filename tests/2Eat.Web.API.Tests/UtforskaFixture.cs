using System.Text;
using _2Eat.Application.Utforska;
using _2Eat.Web.API.Tests.Helpers;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.IdentityModel.Tokens;
using Testcontainers.PostgreSql;

namespace _2Eat.Web.API.Tests;

[CollectionDefinition("Utforska")]
public class UtforskaCollection : ICollectionFixture<UtforskaFixture> { }

public class UtforskaFixture : IAsyncLifetime
{
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
                        ["Jwt:Secret"] = ApiTestFixture.TestJwtSecret,
                        ["Jwt:Issuer"] = ApiTestFixture.TestJwtIssuer,
                        ["Jwt:Audience"] = ApiTestFixture.TestJwtAudience,
                        ["Jwt:ExpiresInMinutes"] = "60",
                    }));

                builder.ConfigureTestServices(services =>
                {
                    services.PostConfigure<JwtBearerOptions>(
                        JwtBearerDefaults.AuthenticationScheme, opts =>
                        {
                            var key = new SymmetricSecurityKey(
                                Encoding.UTF8.GetBytes(ApiTestFixture.TestJwtSecret));
                            opts.TokenValidationParameters.IssuerSigningKey = key;
                            opts.TokenValidationParameters.ValidIssuer = ApiTestFixture.TestJwtIssuer;
                            opts.TokenValidationParameters.ValidAudience = ApiTestFixture.TestJwtAudience;
                        });

                    // Replace the real scraper with a stub — no outbound HTTP in tests.
                    services.Replace(ServiceDescriptor.Scoped<IForslagScraperService, StubForslagScraperService>());
                });
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


var builder = DistributedApplication.CreateBuilder(args);

var jwtSecret = builder.AddParameter("JwtSecret", secret: true);
var anthropicApiKey = builder.AddParameter("AnthropicApiKey", secret: true);
var postgresPassword = builder.AddParameter("PostgresPassword", secret: true);

var postgres = builder.AddPostgres("postgres", password: postgresPassword)
    .WithDataVolume("2eat-postgres-data")
    .WithEnvironment("POSTGRES_DB", "twoeat")
    .AddDatabase("twoeat");

var api = builder.AddProject<Projects._2Eat_Web_API>("api")
    .WithReference(postgres)
    .WithEnvironment("Jwt__Secret", jwtSecret)
    .WithEnvironment("Anthropic__ApiKey", anthropicApiKey)
    .WaitFor(postgres);

builder.AddNpmApp("webapp", "../../src/2Eat.WebApp", "dev")
    .WithReference(api)
    .WithEnvironment("BROWSER", "none")
    .WithHttpEndpoint(port: 5173, env: "PORT")
    .WaitFor(api);

builder.Build().Run();

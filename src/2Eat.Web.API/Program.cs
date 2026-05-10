using _2Eat.Web.API;
using _2Eat.Infrastructure;
using _2Eat.ServiceDefaults;
using System.Text.Json.Serialization;
using Scalar.AspNetCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

builder.AddServiceDefaults();

builder.Configuration.AddJsonFile("appsettings.local.json", optional: true, reloadOnChange: true);

builder.Services.AddOpenApi();
builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
    options.SerializerOptions.PropertyNameCaseInsensitive = true;
    options.SerializerOptions.Converters.Add(new JsonStringEnumConverter());
});
builder.Services.AddHttpContextAccessor();

builder.Services.AddCors(options =>
{
    options.AddPolicy(name: "AllowSpecificOrigin",
        builder =>
        {
            builder.AllowAnyOrigin()
                   .AllowAnyHeader()
                   .AllowAnyMethod();
        });
});

builder.AddInfrastructureExtensions();

// Validate JWT config up-front so a missing section fails at startup with a
// clear message rather than an ArgumentNullException on the first request.
var jwtSecret   = builder.Configuration["Jwt:Secret"];
var jwtIssuer   = builder.Configuration["Jwt:Issuer"];
var jwtAudience = builder.Configuration["Jwt:Audience"];
var jwtExpiry   = builder.Configuration["Jwt:ExpiresInMinutes"];

if (string.IsNullOrWhiteSpace(jwtSecret)   ||
    string.IsNullOrWhiteSpace(jwtIssuer)   ||
    string.IsNullOrWhiteSpace(jwtAudience) ||
    string.IsNullOrWhiteSpace(jwtExpiry))
{
    throw new InvalidOperationException(
        "JWT configuration is incomplete. Make sure the following keys are set:\n" +
        "  Jwt:Secret           (min 32 chars)\n" +
        "  Jwt:Issuer\n" +
        "  Jwt:Audience\n" +
        "  Jwt:ExpiresInMinutes\n\n" +
        "For local dev add them to appsettings.Development.json.\n" +
        "For Docker add them as environment variables in docker-compose.yml.");
}

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer           = true,
            ValidateAudience         = true,
            ValidateLifetime         = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer              = jwtIssuer,
            ValidAudience            = jwtAudience,
            IssuerSigningKey         = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
        };
    });

builder.Services.AddAuthorization();

var app = builder.Build();

app.Services.ApplyMigrations();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

app.UseCors("AllowSpecificOrigin");
app.UseAuthentication();
app.UseAuthorization();

app.MapDefaultEndpoints();

app.MapAuthEndpoints();
app.MapRecipeEndpoints();
app.MapIngredientEndpoints();
app.MapFileEndpoints();
app.MapRecipeScanEndpoints();
app.MapMealPlanEndpoints();
app.MapPantryEndpoints();
app.MapShoppingListEndpoints();

app.Run();

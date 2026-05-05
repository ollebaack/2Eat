using _2Eat.Web.API;
using _2Eat.Infrastructure;
using System.Text.Json.Serialization;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();
builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
    options.SerializerOptions.PropertyNameCaseInsensitive = true;
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

builder.Services.AddInfrastructureExtensions(builder.Configuration);

var app = builder.Build();

app.Services.ApplyMigrations();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

app.UseCors("AllowSpecificOrigin");

app.MapRecipeEndpoints();
app.MapIngredientEndpoints();
app.MapFileEndpoints();
app.MapMealPlanEndpoints();
app.MapPantryEndpoints();

app.Run();

using _2Eat.Web.API;
using _2Eat.Application;
using _2Eat.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer()
    .ConfigureHttpJsonOptions(options =>
    {
        options.SerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.Preserve;
        options.SerializerOptions.PropertyNameCaseInsensitive = true;
    });
builder.Services.AddSwaggerGen();
builder.Services.AddHttpContextAccessor();

// Define a CORS policy
builder.Services.AddCors(options =>
{
    options.AddPolicy(name: "AllowSpecificOrigin",
        builder =>
        {
            builder.WithOrigins("https://localhost:7033")
                   .AllowAnyHeader()
                   .AllowAnyMethod();
        });
});

builder.Services.AddApplicationExtensions();
builder.Services.AddInfrastructureExtensions(builder.Configuration);

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Apply the CORS policy
app.UseCors("AllowSpecificOrigin");

app.MapRecipeEndpoints();
app.MapIngredientEndpoints();

app.UseHttpsRedirection();
app.Run();
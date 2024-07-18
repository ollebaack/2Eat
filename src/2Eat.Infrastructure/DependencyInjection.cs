using _2Eat.Infrastructure.Services.FileServices;
using _2Eat.Infrastructure.Services.IngredientServices;
using _2Eat.Infrastructure.Services.RecipeServices;
using Microsoft.AspNetCore.Components.WebAssembly.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using System.Diagnostics;

namespace _2Eat.Infrastructure
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddInfrastructureExtensions(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddScoped(http => new HttpClient
            {
                BaseAddress = new Uri(configuration.GetSection("BaseUri").Value ?? "http://localhost:5264")
            });

            services.AddDbContext<ApplicationDbContext>(options => 
            {
                //Kommentera ur detta och kör dotnet ef migrations add Initial --project ../../2Eat.Infrastructure
                if (Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") == "Development")
                {
                    options.UseInMemoryDatabase("2EatDb");
                }
                else
                {
                    string db = configuration.GetConnectionString("DefaultConnection") ?? throw new InvalidOperationException("No database connection was found!");
                    var dbPath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), db);
                    options.UseSqlite($"Data Source={dbPath}");
                }
                //string db = configuration.GetConnectionString("DefaultConnection");
                //var dbPath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), db);
                //options.UseSqlite($"Data Source={dbPath}");
            });

            services.AddScoped<IRecipeService, RecipeService>();
            services.AddScoped<IIngredientService, IngredientService>();
            services.AddScoped<IFileService, FileService>();

            return services;
        }
    }
}

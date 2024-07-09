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
                BaseAddress = new Uri(configuration.GetSection("BaseUri").Value!)
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
                    string db = configuration.GetConnectionString("DefaultConnection");
                    var dbPath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), db);
                    options.UseSqlite($"Data Source={dbPath}");
                }
                //string db = configuration.GetConnectionString("DefaultConnection");
                //var dbPath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), db);
                //options.UseSqlite($"Data Source={dbPath}");
            });

            services.AddScoped<IRecipeService, RecipeService>();
            services.AddScoped<IIngredientService, IngredientService>();

            return services;
        }

        public static WebAssemblyHostBuilder AddClientInfrastructureExtensions(this WebAssemblyHostBuilder builder)
        {
            builder.Services.AddScoped<IRecipeService, ClientRecipeService>();
            builder.Services.AddScoped<IIngredientService, ClientIngredientService>();

            builder.Services.AddScoped(http => new HttpClient
            {
                BaseAddress = new Uri(builder.Configuration.GetSection("BaseUri").Value!)
            });

            return builder;
        }
    }
}

using _2Eat.Infrastructure.Services.FileServices;
using _2Eat.Infrastructure.Services.IngredientServices;
using _2Eat.Infrastructure.Services.RecipeServices;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace _2Eat.Infrastructure
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddInfrastructureExtensions(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddDbContext<ApplicationDbContext>(options =>
            {
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
            });

            services.AddScoped<IRecipeService, RecipeService>();
            services.AddScoped<IIngredientService, IngredientService>();
            services.AddScoped<IFileService, FileService>();

            return services;
        }
    }
}

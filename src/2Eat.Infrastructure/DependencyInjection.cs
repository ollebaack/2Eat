using _2Eat.Infrastructure.Services.FileServices;
using _2Eat.Infrastructure.Services.IngredientServices;
using _2Eat.Infrastructure.Services.MealPlanServices;
using _2Eat.Infrastructure.Services.PantryServices;
using _2Eat.Infrastructure.Services.ReceiptScanServices;
using _2Eat.Infrastructure.Services.RecipeServices;
using _2Eat.Infrastructure.Services.UserServices;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace _2Eat.Infrastructure
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddInfrastructureExtensions(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddDbContext<ApplicationDbContext>(options =>
                options
                    .UseNpgsql(
                        configuration.GetConnectionString("DefaultConnection")
                            ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.")
                    )
                    .ConfigureWarnings(w => w.Ignore(RelationalEventId.PendingModelChangesWarning))
            );

            services.AddScoped<IRecipeService, RecipeService>();
            services.AddScoped<IIngredientService, IngredientService>();
            services.AddScoped<IFileService, FileService>();
            services.AddScoped<IMealPlanService, MealPlanService>();
            services.AddScoped<IPantryItemService, PantryItemService>();
            services.AddScoped<IUserService, UserService>();
            services.AddScoped<IReceiptScanService, ReceiptScanService>();

            return services;
        }
    }
}

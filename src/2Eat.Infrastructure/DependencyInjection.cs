using _2Eat.Application.Auth;
using _2Eat.Infrastructure.Auth;
using _2Eat.Application.Files;
using _2Eat.Infrastructure.Files;
using _2Eat.Application.Ingredients;
using _2Eat.Infrastructure.Ingredients;
using _2Eat.Application.MealPlanning;
using _2Eat.Infrastructure.MealPlanning;
using _2Eat.Application.Pantry;
using _2Eat.Infrastructure.Pantry;
using _2Eat.Application.Recipes;
using _2Eat.Infrastructure.Recipes;
using _2Eat.Application.ShoppingLists;
using _2Eat.Infrastructure.ShoppingLists;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace _2Eat.Infrastructure
{
    public static class DependencyInjection
    {
        public static IHostApplicationBuilder AddInfrastructureExtensions(this IHostApplicationBuilder builder)
        {
            builder.Services.AddDbContext<ApplicationDbContext>(options =>
                options
                    .UseNpgsql(
                        builder.Configuration.GetConnectionString("twoeat")
                            ?? throw new InvalidOperationException("Connection string 'twoeat' not found.")
                    )
                    .ConfigureWarnings(w => w.Ignore(RelationalEventId.PendingModelChangesWarning))
            );

            builder.Services.AddScoped<IRecipeRepository, EfRecipeRepository>();
            builder.Services.AddScoped<IRecipeService, RecipeService>();
            builder.Services.AddScoped<IIngredientRepository, EfIngredientRepository>();
            builder.Services.AddScoped<IIngredientService, IngredientService>();
            builder.Services.AddScoped<IFileRepository, EfFileRepository>();
            builder.Services.AddScoped<IFileService, FileService>();
            builder.Services.AddScoped<IMealPlanRepository, EfMealPlanRepository>();
            builder.Services.AddScoped<IMealPlanService, MealPlanService>();
            builder.Services.AddScoped<IPantryRepository, EfPantryRepository>();
            builder.Services.AddScoped<IPantryItemService, PantryItemService>();
            builder.Services.AddScoped<IUserRepository, EfUserRepository>();
            builder.Services.AddScoped<IUserService, UserService>();
            builder.Services.AddScoped<IReceiptScanService, ReceiptScanClient>();
            builder.Services.AddScoped<IShoppingListRepository, EfShoppingListRepository>();
            builder.Services.AddScoped<IShoppingListService, ShoppingListService>();

            builder.Services.AddHttpClient("RecipeScan", c =>
            {
                c.Timeout = TimeSpan.FromSeconds(20);
                c.DefaultRequestHeaders.UserAgent.ParseAdd("2Eat-RecipeScanner/1.0");
            });
            builder.Services.AddScoped<IRecipeScanService, RecipeScanClient>();

            return builder;
        }
    }
}

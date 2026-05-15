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
using _2Eat.Application.Samlingar;
using _2Eat.Infrastructure.Samlingar;
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
            builder.Services.AddScoped<ITextParsePantryService, TextParsePantryClient>();
            builder.Services.AddScoped<IShoppingListRepository, EfShoppingListRepository>();
            builder.Services.AddScoped<IShoppingListService, ShoppingListService>();
            builder.Services.AddScoped<ISamlingRepository, EfSamlingRepository>();
            builder.Services.AddScoped<ISamlingService, SamlingService>();

            builder.Services.AddHttpClient("RecipeScan", c =>
            {
                c.Timeout = TimeSpan.FromSeconds(30);
                c.DefaultRequestHeaders.UserAgent.ParseAdd(
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36");
                c.DefaultRequestHeaders.AcceptLanguage.ParseAdd("sv-SE,sv;q=0.9,en-US;q=0.8,en;q=0.7");
                c.DefaultRequestHeaders.Accept.ParseAdd("text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8");
            });
            builder.Services.AddHttpClient("InstagramScan", c =>
            {
                c.Timeout = TimeSpan.FromSeconds(30);
                // Instagram (Meta) serves server-side rendered HTML with OG meta tags to Meta's
                // own external hit scraper, ensuring posts preview well when shared on Facebook.
                c.DefaultRequestHeaders.UserAgent.ParseAdd(
                    "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)");
                c.DefaultRequestHeaders.AcceptLanguage.ParseAdd("en-US,en;q=0.9");
                c.DefaultRequestHeaders.Accept.ParseAdd("text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8");
            });
            builder.Services.AddScoped<IRecipeScanService, RecipeScanClient>();

            return builder;
        }
    }
}

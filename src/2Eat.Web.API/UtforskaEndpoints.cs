using System.Security.Claims;
using _2Eat.Application.Recipes;
using _2Eat.Application.Samlingar;
using _2Eat.Application.Utforska;
using _2Eat.Domain;
using _2Eat.Domain.Enums;

namespace _2Eat.Web.API;

public static class UtforskaEndpoints
{
    public static void MapUtforskaEndpoints(this IEndpointRouteBuilder endpoints)
    {
        var utforska = endpoints.MapGroup("/api/utforska").RequireAuthorization();
        utforska.MapGet("/", GetNext);
        utforska.MapGet("/all", GetAllUnseen);
        utforska.MapPost("/{id}/add", FastAdd);

        var admin = endpoints.MapGroup("/api/admin").RequireAuthorization();
        admin.MapPost("/forslag/refresh", RefreshPool);
    }

    // GET /api/utforska  — returns next 10 unseen Förslag for the authenticated user
    static async Task<IResult> GetNext(ClaimsPrincipal principal, IForslagService service)
    {
        var userId = principal.GetUserId();
        if (userId is null) return Results.Unauthorized();

        var items = await service.GetNextAsync(userId.Value);
        var dtos = items.Select(f => new ForslagDto(f.Id, f.Title, f.ImageUrl, f.SourceUrl, f.SourceSite, [])).ToList();
        return Results.Ok(dtos);
    }

    // GET /api/utforska/all  — returns all unseen Förslag with ingredient names (no cursor advance)
    static async Task<IResult> GetAllUnseen(ClaimsPrincipal principal, IForslagService service)
    {
        var userId = principal.GetUserId();
        if (userId is null) return Results.Unauthorized();

        var items = await service.GetAllUnseenAsync(userId.Value);
        var dtos = items.Select(f => new ForslagDto(
            f.Id, f.Title, f.ImageUrl, f.SourceUrl, f.SourceSite,
            f.IngredientNames.Select(n => n.Name).ToList())).ToList();
        return Results.Ok(dtos);
    }

    // POST /api/utforska/{id}/add  — scan & import a Förslag as a full Recept
    static async Task<IResult> FastAdd(
        int id,
        ClaimsPrincipal principal,
        IForslagService forslagService,
        IRecipeScanService scanService,
        IRecipeService recipeService,
        ISamlingService samlingService,
        HttpContext context)
    {
        var userId = principal.GetUserId();
        if (userId is null) return Results.Unauthorized();

        var forslag = await forslagService.GetByIdAsync(id);
        if (forslag is null) return Results.NotFound();

        if (!scanService.IsConfigured)
            return Results.Problem(detail: "Recipe scan is not configured on this server.", statusCode: 503);

        var req = await context.Request.ReadFromJsonAsync<FastAddRequest>();

        // Run the full extraction
        var scanned = await scanService.ScanFromUrlAsync(forslag.SourceUrl);

        // Map ScannedRecipeDto → Recipe domain entity
        var categories = await recipeService.GetCategoriesAsync();
        var recipe = MapScannedToRecipe(scanned, forslag, categories);

        Recipe created;
        try
        {
            created = await recipeService.AddRecipeAsync(recipe, userId.Value);
        }
        catch (ArgumentException ex)
        {
            return Results.Problem(detail: ex.Message, statusCode: 400);
        }

        // Add to requested Samlingar (failures are non-fatal — recipe is already saved)
        if (req?.SamlingIds is { Count: > 0 } samlingIds)
        {
            foreach (var samlingId in samlingIds)
            {
                try { await samlingService.AddReceptAsync(samlingId, created.Id, userId.Value); }
                catch (KeyNotFoundException) { /* Samling no longer exists — skip */ }
            }
        }

        return Results.Ok(new { id = created.Id, name = created.Name });
    }

    // POST /api/admin/forslag/refresh  — manually trigger pool refresh
    static async Task<IResult> RefreshPool(IForslagService service)
    {
        var (_, message) = await service.RefreshPoolAsync();
        return Results.Ok(new { message });
    }

    // ─── Private helpers ─────────────────────────────────────────────────────

    private static Recipe MapScannedToRecipe(
        _2Eat.Application.Recipes.Dtos.ScannedRecipeDto scan,
        _2Eat.Domain.Forslag forslag,
        List<Category> categories)
    {
        var categoryId = categories
            .FirstOrDefault(c => string.Equals(c.Name, scan.CategoryName, StringComparison.OrdinalIgnoreCase))
            ?.Id ?? 5; // Default to "Övrigt"

        var instructions = scan.Steps is { Length: > 0 }
            ? string.Join("\n", scan.Steps.Select((s, i) => $"{i + 1}. {s}"))
            : string.Empty;

        var allergens = new List<Allergen>();
        if (scan.Allergens is { Length: > 0 })
        {
            foreach (var allergenName in scan.Allergens)
            {
                if (Enum.TryParse<AllergenEnum>(allergenName, ignoreCase: true, out var parsed))
                    allergens.Add(new Allergen { Id = parsed });
            }
        }

        var ingredients = new List<RecipeIngredient>();
        if (scan.Ingredients is { Length: > 0 })
        {
            for (var i = 0; i < scan.Ingredients.Length; i++)
            {
                var si = scan.Ingredients[i];
                if (string.IsNullOrWhiteSpace(si.Name)) continue;

                if (!Enum.TryParse<_2Eat.Domain.Enums.UnitOfMeasurement>(si.Unit, ignoreCase: true, out var unit))
                    unit = _2Eat.Domain.Enums.UnitOfMeasurement.st;

                ingredients.Add(new RecipeIngredient
                {
                    Order = i,
                    Ingredient = new Ingredient { Name = si.Name, CategoryId = 5 },
                    IngredientMeasurement = new IngredientMeasurement
                    {
                        Quantity = (int)Math.Max(1, si.Quantity ?? 1),
                        Unit = unit,
                    },
                });
            }
        }

        return new Recipe
        {
            Name = scan.Name ?? forslag.Title,
            Description = scan.Description ?? string.Empty,
            Instructions = instructions,
            ImageUrl = scan.ImageUrl ?? forslag.ImageUrl,
            CategoryId = categoryId,
            Servings = scan.Servings ?? 4,
            Rating = 0,
            Difficulty = scan.Difficulty ?? "Medel",
            PrepTime = scan.PrepTime ?? 0,
            CookTime = scan.CookTime ?? 0,
            Calories = scan.Calories,
            Protein = scan.Protein,
            Fat = scan.Fat,
            Carbs = scan.Carbs,
            Allergens = allergens,
            Ingredients = ingredients,
        };
    }

    record ForslagDto(int Id, string Title, string? ImageUrl, string SourceUrl, string SourceSite, List<string> IngredientNames);
    record FastAddRequest(List<int>? SamlingIds);
}

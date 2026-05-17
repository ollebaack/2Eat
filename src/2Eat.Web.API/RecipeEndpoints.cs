using _2Eat.Application;
using _2Eat.Domain;
using _2Eat.Application.Recipes;
using Microsoft.AspNetCore.Http.HttpResults;
using System.Security.Claims;

namespace _2Eat.Web.API
{
    public static class RecipeEndpoints
    {
        public static void MapRecipeEndpoints(this IEndpointRouteBuilder endpoints)
        {
            endpoints.MapGet("/api/categories", GetCategories).RequireAuthorization();

            endpoints.MapGet("/api/recipes", GetRecipes).RequireAuthorization();

            endpoints.MapGet("/api/recipes/feed", GetRecipesFeed).RequireAuthorization();

            endpoints.MapGet("/api/recipes/random/{count}", GetRandomRecipes).RequireAuthorization();

            endpoints.MapGet("/api/recipes/{id}", GetRecipeById).RequireAuthorization();

            endpoints.MapPost("/api/recipes", CreateRecipe).RequireAuthorization();

            endpoints.MapPut("/api/recipes/{id}", UpdateRecipe).RequireAuthorization();

            endpoints.MapDelete("/api/recipes/{id}", DeleteRecipe).RequireAuthorization();
        }

        public static async Task<Ok<List<Category>>> GetCategories(IRecipeService _service)
        {
            var categories = await _service.GetCategoriesAsync();
            return TypedResults.Ok(categories);
        }

        public static async Task<Results<Ok<List<Recipe>>, NotFound, ProblemHttpResult>> GetRecipes(
            IRecipeService _service, ClaimsPrincipal user)
        {
            var userId = user.GetUserId();
            if (userId is null)
                return TypedResults.Problem(detail: "Unauthorized.", statusCode: 401);

            var recipes = await _service.GetRecipesAsync(userId.Value);
            if (recipes == null)
                return TypedResults.NotFound();

            return TypedResults.Ok(recipes);
        }

        public static async Task<Results<Ok<PagedResult<Recipe>>, ProblemHttpResult>> GetRecipesFeed(
            IRecipeService _service,
            ClaimsPrincipal user,
            string? search = null,
            int? categoryId = null,
            string? allergens = null,
            string? ingredientIds = null,
            int page = 0,
            int pageSize = 8,
            int seed = 1)
        {
            var userId = user.GetUserId();
            if (userId is null)
                return TypedResults.Problem(detail: "Unauthorized.", statusCode: 401);

            var query = new RecipeQuery
            {
                UserId = userId.Value,
                Search = search,
                CategoryId = categoryId,
                Allergens = string.IsNullOrWhiteSpace(allergens)
                    ? []
                    : allergens.Split(',').Where(s => !string.IsNullOrWhiteSpace(s)).ToList(),
                IngredientIds = string.IsNullOrWhiteSpace(ingredientIds)
                    ? []
                    : ingredientIds.Split(',').Select(int.Parse).ToList(),
                Page = page,
                PageSize = pageSize,
                Seed = seed,
            };
            var result = await _service.GetRecipesPageAsync(query);
            return TypedResults.Ok(result);
        }

        public static async Task<Results<Ok<List<Recipe>>, NotFound, ProblemHttpResult>> GetRandomRecipes(
            int count, IRecipeService _service, ClaimsPrincipal user)
        {
            var userId = user.GetUserId();
            if (userId is null)
                return TypedResults.Problem(detail: "Unauthorized.", statusCode: 401);

            var randomRecipes = await _service.GetRandomRecipesAsync(count, userId.Value);
            if (randomRecipes == null)
                return TypedResults.NotFound();

            return TypedResults.Ok(randomRecipes);
        }

        public static async Task<Results<Ok<Recipe>, NotFound, ProblemHttpResult>> GetRecipeById(
            int id, IRecipeService _service, ClaimsPrincipal user)
        {
            var userId = user.GetUserId();
            if (userId is null)
                return TypedResults.Problem(detail: "Unauthorized.", statusCode: 401);

            var recipe = await _service.GetRecipeByIdAsync(id, userId.Value);
            if (recipe == null)
                return TypedResults.NotFound();

            return TypedResults.Ok(recipe);
        }

        public static async Task<Results<Ok<Recipe>, ProblemHttpResult>> CreateRecipe(
            IRecipeService _service, HttpContext context, ClaimsPrincipal user)
        {
            var userId = user.GetUserId();
            if (userId is null)
                return TypedResults.Problem(detail: "Unauthorized.", statusCode: 401);

            var recipe = await context.Request.ReadFromJsonAsync<Recipe>();
            if (recipe == null)
                return TypedResults.Problem(detail: "Invalid recipe payload.", statusCode: 400);

            try
            {
                var newRecipe = await _service.AddRecipeAsync(recipe, userId.Value);
                return TypedResults.Ok(newRecipe);
            }
            catch (ArgumentException ex)
            {
                return TypedResults.Problem(detail: ex.Message, statusCode: 400);
            }
        }

        public static async Task<Results<Ok<Recipe>, ProblemHttpResult>> UpdateRecipe(
            int id, IRecipeService _service, HttpContext context, ClaimsPrincipal user)
        {
            var userId = user.GetUserId();
            if (userId is null)
                return TypedResults.Problem(detail: "Unauthorized.", statusCode: 401);

            var recipe = await context.Request.ReadFromJsonAsync<Recipe>();
            if (recipe == null)
                return TypedResults.Problem(detail: "Invalid recipe payload.", statusCode: 400);

            try
            {
                var updatedRecipe = await _service.UpdateRecipeAsync(id, recipe, userId.Value);
                return TypedResults.Ok(updatedRecipe);
            }
            catch (Exception ex)
            {
                return TypedResults.Problem(detail: ex.Message, statusCode: 400);
            }
        }

        public static async Task<Results<Ok<Recipe>, NotFound, ProblemHttpResult>> DeleteRecipe(
            int id, IRecipeService _service, ClaimsPrincipal user)
        {
            var userId = user.GetUserId();
            if (userId is null)
                return TypedResults.Problem(detail: "Unauthorized.", statusCode: 401);

            var recipe = await _service.GetRecipeByIdAsync(id, userId.Value);
            if (recipe == null)
                return TypedResults.NotFound();

            try
            {
                var deletedRecipe = await _service.DeleteRecipeAsync(id, userId.Value);
                return TypedResults.Ok(deletedRecipe);
            }
            catch (Exception ex)
            {
                return TypedResults.Problem(detail: ex.Message, statusCode: 400);
            }
        }
    }
}

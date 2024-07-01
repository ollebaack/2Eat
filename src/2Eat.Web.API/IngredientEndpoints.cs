using _2Eat.Domain;
using _2Eat.Infrastructure.Services.IngredientServices;
using _2Eat.Infrastructure.Services.RecipeServices;
using Microsoft.AspNetCore.Http.HttpResults;

namespace _2Eat.Web.API
{
    public static class IngredientEndpoints
    {
        public static void MapIngredientEndpoints(this IEndpointRouteBuilder endpoints)
        {
            endpoints.MapGet("/api/ingredients", GetIngredients);

            endpoints.MapGet("/api/ingredients/{id}", GetIngredientById);

            endpoints.MapPost("/api/ingredients", CreateIngredient);

            endpoints.MapDelete("/api/ingredients/{id}", DeleteIngredient);
        }

        public static async Task<Results<Ok<List<Ingredient>>, NotFound>> GetIngredients(IIngredientService _service)
        {
            var ingredients = await _service.GetIngredientsAsync();
            if (ingredients == null)
            {
                return TypedResults.NotFound();
            }

            return TypedResults.Ok(ingredients);
        }

        public static async Task<Results<Ok<Ingredient>, NotFound>> GetIngredientById(int id, IIngredientService _service)
        {
            var Ingredient = await _service.GetIngredientByIdAsync(id);
            if (Ingredient == null)
            {
                return TypedResults.NotFound();
            }

            return TypedResults.Ok(Ingredient);
        }

        public static async Task<Results<Ok<Ingredient>, BadRequest, ProblemHttpResult>> CreateIngredient(IIngredientService _service, HttpContext context)
        {
            var Ingredient = await context.Request.ReadFromJsonAsync<Ingredient>();
            if (Ingredient == null)
            {
                return TypedResults.BadRequest();
            }

            try
            {
                var newIngredient = await _service.AddIngredientAsync(Ingredient);

                return TypedResults.Ok(newIngredient);
            }
            catch (ArgumentException ex)
            {
                return TypedResults.Problem(detail: ex.Message, statusCode: 400);
            }
        }

        public static async Task<Results<Ok<Ingredient>, NotFound, ProblemHttpResult>> DeleteIngredient(int id, IIngredientService _service)
        {
            var Ingredient = await _service.GetIngredientByIdAsync(id);
            if (Ingredient == null)
            {
                return TypedResults.NotFound();
            }
            try
            {
                var deletedIngredient = await _service.DeleteIngredientAsync(id);
                return TypedResults.Ok(deletedIngredient);
            }
            catch (Exception ex)
            {
                return TypedResults.Problem(detail: ex.Message, statusCode: 400);
            }
        }
    }
}

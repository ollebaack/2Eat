﻿using _2Eat.Domain;
using _2Eat.Infrastructure.Services.RecipeServices;
using Microsoft.AspNetCore.Http.HttpResults;

namespace _2Eat.Web.API
{
    public static class RecipeEndpoints
    {
        public static void MapRecipeEndpoints(this IEndpointRouteBuilder endpoints)
        {
            endpoints.MapGet("/api/recipes", GetRecipes);

            endpoints.MapGet("/api/recipes/{id}", GetRecipeById);

            endpoints.MapPost("/api/recipes", CreateRecipe);

            endpoints.MapPut("/api/recipes/{id}", UpdateRecipe);

            endpoints.MapDelete("/api/recipes/{id}", DeleteRecipe);
        }

        public static async Task<Results<Ok<List<Recipe>>, NotFound>> GetRecipes(IRecipeService _service)
        {
            var recipes = await _service.GetRecipesAsync();
            if (recipes == null)
            {
                return TypedResults.NotFound();
            }

            return TypedResults.Ok(recipes);
        }

        public static async Task<Results<Ok<Recipe>, NotFound>> GetRecipeById(int id, IRecipeService _service)
        {
            var recipe = await _service.GetRecipeByIdAsync(id);
            if (recipe == null)
            {
                return TypedResults.NotFound();
            }

            return TypedResults.Ok(recipe);
        }

        public static async Task<Results<Ok<Recipe>, BadRequest>> CreateRecipe(IRecipeService _service, HttpContext context)
        {
            var recipe = await context.Request.ReadFromJsonAsync<Recipe>();
            if (recipe == null)
            {
                return TypedResults.BadRequest();
            }

            var newRecipe = await _service.AddRecipeAsync(recipe);

            return TypedResults.Ok(newRecipe);
        }

        public static async Task<Results<Ok<Recipe>, BadRequest>> UpdateRecipe(int id, IRecipeService _service, HttpContext context)
        {
            var recipe = await context.Request.ReadFromJsonAsync<Recipe>();
            if (recipe == null)
            {
                return TypedResults.BadRequest();
            }

            var updatedRecipe = await _service.UpdateRecipeAsync(id, recipe);

            return TypedResults.Ok(updatedRecipe);
        }

        public static async Task<Results<Ok<Recipe>, NotFound>> DeleteRecipe(int id, IRecipeService _service)
        {
            var recipe = await _service.GetRecipeByIdAsync(id);
            if (recipe == null)
            {
                return TypedResults.NotFound();
            }

            var deletedRecipe = await _service.DeleteRecipeAsync(id);
            return TypedResults.Ok(deletedRecipe);
        }
    }
}
using System.Net.Http.Json;
using System.Text.Json;
using _2Eat.Web.API.Tests.Helpers;

namespace _2Eat.Web.API.Tests;

[Collection("Api")]
public class MealPlanTests(ApiTestFixture fixture)
{
    private const string WeekDate = "2026-01-05";

    [Fact]
    public async Task GetWeekPlan_CreatesPlanIfMissing_Returns200()
    {
        var client = await fixture.CreateAuthenticatedClientAsync();

        var response = await client.GetAsync($"/api/mealplan/week/{WeekDate}");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<JsonElement>();
        Assert.True(body.GetProperty("id").GetInt32() > 0);
    }

    [Fact]
    public async Task SetDaySlot_WithNullRecipeId_ReturnsSuccess()
    {
        var client = await fixture.CreateAuthenticatedClientAsync();
        await client.GetAsync($"/api/mealplan/week/{WeekDate}");

        var response = await client.PutAsJsonAsync($"/api/mealplan/week/{WeekDate}/day/1", new
        {
            recipeId = (int?)null,
            note = "Free day"
        });

        Assert.True(
            response.StatusCode == HttpStatusCode.OK || response.StatusCode == HttpStatusCode.NoContent,
            $"Expected 200 or 204 but got {response.StatusCode}");
    }

    [Fact]
    public async Task ClearDaySlot_Returns204()
    {
        var client = await fixture.CreateAuthenticatedClientAsync();

        await client.GetAsync($"/api/mealplan/week/{WeekDate}");

        var response = await client.DeleteAsync($"/api/mealplan/week/{WeekDate}/day/2");
        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
    }

    [Fact]
    public async Task MealPlans_AreUserScoped_UserAAndUserBGetDifferentPlanIds()
    {
        var clientA = fixture.Factory.CreateClient();
        var clientB = fixture.Factory.CreateClient();
        await Task.WhenAll(
            AuthHelper.AuthenticateClientAsync(clientA),
            AuthHelper.AuthenticateClientAsync(clientB));

        var respA = await clientA.GetAsync($"/api/mealplan/week/{WeekDate}");
        var respB = await clientB.GetAsync($"/api/mealplan/week/{WeekDate}");

        var planA = await respA.Content.ReadFromJsonAsync<JsonElement>();
        var planB = await respB.Content.ReadFromJsonAsync<JsonElement>();

        var idA = planA.GetProperty("id").GetInt32();
        var idB = planB.GetProperty("id").GetInt32();

        Assert.NotEqual(idA, idB);
    }
}

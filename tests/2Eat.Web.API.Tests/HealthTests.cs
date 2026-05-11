namespace _2Eat.Web.API.Tests;

[Collection("Api")]
public class HealthTests(ApiTestFixture fixture)
{
    [Fact]
    public async Task Health_ReturnsOk()
    {
        var client = fixture.Factory.CreateClient();
        var response = await client.GetAsync("/health");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }
}

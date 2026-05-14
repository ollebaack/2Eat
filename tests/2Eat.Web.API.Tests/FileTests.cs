using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using _2Eat.Web.API.Tests.Helpers;

namespace _2Eat.Web.API.Tests;

[Collection("Api")]
public class FileTests(ApiTestFixture fixture)
{
    /// <summary>
    /// Creates a minimal multipart/form-data request with a small PNG-like byte payload.
    /// </summary>
    private static MultipartFormDataContent CreateTestFileContent(
        string fileName = "test.png",
        string contentType = "image/png")
    {
        // A minimal 1-byte payload — enough for the upload to succeed without needing a real image.
        var bytes = Encoding.UTF8.GetBytes("FAKE_IMAGE_CONTENT");
        var fileContent = new ByteArrayContent(bytes);
        fileContent.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue(contentType);

        var form = new MultipartFormDataContent();
        form.Add(fileContent, "file", fileName);
        return form;
    }

    [Fact]
    public async Task UploadFile_HappyPath_Returns200WithFileUploadRecord()
    {
        var client = await fixture.CreateAuthenticatedClientAsync();

        using var form = CreateTestFileContent();
        var response = await client.PostAsync("/api/files", form);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<JsonElement>();
        Assert.True(body.GetProperty("id").GetInt32() > 0);
        Assert.False(string.IsNullOrWhiteSpace(body.GetProperty("storedFileName").GetString()));
        Assert.Equal("test.png", body.GetProperty("fileName").GetString());
    }

    [Fact]
    public async Task UploadFile_WithoutToken_Returns401()
    {
        var client = fixture.Factory.CreateClient();

        using var form = CreateTestFileContent();
        var response = await client.PostAsync("/api/files", form);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task DownloadFile_AfterUpload_Returns200WithFileBytes()
    {
        var client = await fixture.CreateAuthenticatedClientAsync();

        // Upload first to get a storedFileName.
        using var form = CreateTestFileContent("download-test.png");
        var uploadResp = await client.PostAsync("/api/files", form);
        Assert.Equal(HttpStatusCode.OK, uploadResp.StatusCode);

        var body = await uploadResp.Content.ReadFromJsonAsync<JsonElement>();
        var storedFileName = body.GetProperty("storedFileName").GetString()!;

        // Download using the stored file name — no auth required on this endpoint.
        var downloadResp = await client.GetAsync($"/api/files/{storedFileName}");

        Assert.Equal(HttpStatusCode.OK, downloadResp.StatusCode);
        var bytes = await downloadResp.Content.ReadAsByteArrayAsync();
        Assert.True(bytes.Length > 0);
    }

    [Fact]
    public async Task DownloadFile_NonExistentStoredFileName_Returns404()
    {
        // Authenticated request for a file that doesn't exist should return 404.
        var client = await fixture.CreateAuthenticatedClientAsync();

        var response = await client.GetAsync("/api/files/nonexistent-file-that-does-not-exist.tmp");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }
}

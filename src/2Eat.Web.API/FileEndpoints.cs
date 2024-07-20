using System.Reflection;
using _2Eat.Domain.Files;
using _2Eat.Infrastructure.Services.FileServices;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;

namespace _2Eat.Web.API
{
    public static class FileEndpoints
    {
        public static void MapFileEndpoints(this IEndpointRouteBuilder endpoints)
        {
            //endpoints.MapGet("/api/files", GetFiles);

            endpoints.MapGet("/api/files/{fileName}", DownloadFileByFileName);

            endpoints.MapPost("/api/files", CreateFile).DisableAntiforgery();

            //endpoints.MapDelete("/api/files/{id}", DeleteFile);
        }

        private static async Task<IResult> DownloadFileByFileName(string fileName, IFileService _service, IWebHostEnvironment _env, HttpClient Http)
        {
            var uploadResult = await _service.GetFileByFileNameAsync(fileName);

            if (uploadResult == null)
            {
                return TypedResults.NotFound();
            }

            var path = Path.Combine(_env.ContentRootPath, "uploads", fileName);

            var memory = new MemoryStream();

            using (var stream = new FileStream(path, FileMode.Open))
            {
                await stream.CopyToAsync(memory);   
            }

            memory.Position = 0;
            // return memory.ToArray();
            return Results.File(memory.ToArray(), uploadResult.ContentType, uploadResult.FileName);
            // return TypedResults.Ok(new FileContentResult(memory.ToArray(), uploadResult.ContentType));
            // return memory;

            // await using var file = await Http.GetStreamAsync(path);
            // using var memoryStream = new MemoryStream();
            
            // await file.CopyToAsync(memoryStream);
            // return memoryStream.ToArray();
            
            // return imgStreamRef;
            // var file = new Mem(memory, uploadResult.ContentType, Path.GetFileName(fileName));
            // return memory;
        }

        private static async Task<Results<Ok<FileUpload>, BadRequest>> CreateFile(IFormFile file, IWebHostEnvironment _env, IFileService _service)
        {
            //var file = files.FirstOrDefault();

            var uploadResult = await UploadFile(file, _env);

            if (uploadResult is null)
            {
                return TypedResults.BadRequest();
            }

            var addedFile = await _service.AddFileAsync(uploadResult);

            if (addedFile is null)
            {
                return TypedResults.BadRequest();
            }

            return TypedResults.Ok(addedFile);
        }

        private static async Task<FileUpload> UploadFile(IFormFile file, IWebHostEnvironment env)
        {
            var uploadResult = new FileUpload();
            string trustedFileNameForFileStorage;
            var untrestedFileName = file.FileName;
            //var trustedFileName = WebUtility.HtmlEncode(untrestedFileName);

            trustedFileNameForFileStorage = Path.GetRandomFileName();
            var path = Path.Combine(env.ContentRootPath, "uploads", trustedFileNameForFileStorage);

            await using FileStream fs = new(path, FileMode.Create);
            await file.CopyToAsync(fs);

            uploadResult.FileName = untrestedFileName;
            uploadResult.StoredFileName = trustedFileNameForFileStorage;
            uploadResult.FileSize = file.Length;
            uploadResult.ContentType = file.ContentType;
            uploadResult.IsSuccess = true;

            return uploadResult;
        }
    }
}

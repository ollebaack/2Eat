using _2Eat.Domain;
using _2Eat.Domain.Files;
using Microsoft.AspNetCore.Http;

namespace _2Eat.Infrastructure.Services.FileServices
{
    public interface IFileService
    {
        Task<List<FileUpload>> GetFilesAsync();
        Task<FileUpload?> GetFileByIdAsync(int id);
        Task<FileUpload?> GetFileByFileNameAsync(string fileName);
        Task<FileUpload> AddFileAsync(FileUpload file);
        Task<FileUpload> DeleteFileAsync(int id);
    }
}

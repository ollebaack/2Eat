using _2Eat.Domain.Files;

namespace _2Eat.Application.Files;

public interface IFileService
{
    Task<List<FileUpload>> GetFilesAsync();
    Task<FileUpload?> GetFileByIdAsync(int id);
    Task<FileUpload?> GetFileByFileNameAsync(string fileName);
    Task<FileUpload> AddFileAsync(FileUpload file);
    Task<FileUpload> DeleteFileAsync(int id);
}

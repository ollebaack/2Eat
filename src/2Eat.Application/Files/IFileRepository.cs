using _2Eat.Domain.Files;

namespace _2Eat.Application.Files;

public interface IFileRepository
{
    Task<List<FileUpload>> GetAllAsync();
    Task<FileUpload?> GetByIdAsync(int id);
    Task<FileUpload?> GetByStoredFileNameAsync(string fileName);
    Task<FileUpload> AddAsync(FileUpload file);
    Task RemoveAsync(FileUpload file);
    Task SaveAsync();
}

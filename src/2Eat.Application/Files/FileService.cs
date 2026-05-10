using _2Eat.Domain.Files;

namespace _2Eat.Application.Files;

public class FileService(IFileRepository repository) : IFileService
{
    public Task<FileUpload> AddFileAsync(FileUpload file) => repository.AddAsync(file);

    public Task<FileUpload?> GetFileByFileNameAsync(string fileName) =>
        repository.GetByStoredFileNameAsync(fileName);

    public Task<FileUpload> DeleteFileAsync(int id) => throw new NotImplementedException();

    public Task<FileUpload?> GetFileByIdAsync(int id) => throw new NotImplementedException();

    public Task<List<FileUpload>> GetFilesAsync() => throw new NotImplementedException();
}

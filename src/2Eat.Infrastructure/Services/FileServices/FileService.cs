using _2Eat.Domain;
using _2Eat.Domain.Files;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Http;

namespace _2Eat.Infrastructure.Services.FileServices
{
    public class FileService : IFileService
    {
        private readonly ApplicationDbContext _context;

        public FileService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<FileUpload> AddFileAsync(FileUpload file)
        {
            var addedFile = await _context.Files.AddAsync(file);
            await _context.SaveChangesAsync();
            return addedFile.Entity;
        }

        public Task<FileUpload?> GetFileByFileNameAsync(string fileName) 
            => _context.Files.FirstOrDefaultAsync(f => f.StoredFileName == fileName);

        Task<FileUpload> IFileService.DeleteFileAsync(int id)
        {
            throw new NotImplementedException();
        }

        Task<FileUpload?> IFileService.GetFileByIdAsync(int id)
        {
            throw new NotImplementedException();
        }

        Task<List<FileUpload>> IFileService.GetFilesAsync()
        {
            throw new NotImplementedException();
        }
    }
}

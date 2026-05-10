using _2Eat.Application.Files;
using _2Eat.Domain.Files;
using Microsoft.EntityFrameworkCore;

namespace _2Eat.Infrastructure.Files;

public class EfFileRepository(ApplicationDbContext context) : IFileRepository
{
    public Task<List<FileUpload>> GetAllAsync() => context.Files.ToListAsync();

    public Task<FileUpload?> GetByIdAsync(int id) =>
        context.Files.FirstOrDefaultAsync(f => f.Id == id);

    public Task<FileUpload?> GetByStoredFileNameAsync(string fileName) =>
        context.Files.FirstOrDefaultAsync(f => f.StoredFileName == fileName);

    public async Task<FileUpload> AddAsync(FileUpload file)
    {
        var entry = await context.Files.AddAsync(file);
        await context.SaveChangesAsync();
        return entry.Entity;
    }

    public async Task RemoveAsync(FileUpload file)
    {
        context.Files.Remove(file);
        await context.SaveChangesAsync();
    }

    public Task SaveAsync() => context.SaveChangesAsync();
}

using _2Eat.Application.Auth;
using _2Eat.Domain;
using Microsoft.EntityFrameworkCore;

namespace _2Eat.Infrastructure.Auth;

public class EfUserRepository(ApplicationDbContext context) : IUserRepository
{
    public Task<bool> EmailExistsAsync(string emailLower) =>
        context.Users.AnyAsync(u => u.Email == emailLower);

    public async Task<User> AddAsync(User user)
    {
        context.Users.Add(user);
        await context.SaveChangesAsync();
        return user;
    }

    public Task<User?> FindByEmailAsync(string emailLower) =>
        context.Users.FirstOrDefaultAsync(u => u.Email == emailLower);

    public Task<User?> GetByIdAsync(int userId) =>
        context.Users.FindAsync(userId).AsTask();

    public Task SaveAsync() =>
        context.SaveChangesAsync();

    public async Task RemoveAsync(User user)
    {
        context.Users.Remove(user);
        await context.SaveChangesAsync();
    }
}

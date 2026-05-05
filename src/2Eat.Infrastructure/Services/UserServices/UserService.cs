using _2Eat.Domain;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace _2Eat.Infrastructure.Services.UserServices
{
    public class UserService(ApplicationDbContext context) : IUserService
    {
        private readonly PasswordHasher<User> _hasher = new();

        public async Task<User?> RegisterAsync(string email, string password, string displayName)
        {
            var emailLower = email.ToLowerInvariant();
            if (await context.Users.AnyAsync(u => u.Email == emailLower))
                return null;

            var user = new User
            {
                Email = emailLower,
                DisplayName = displayName,
                CreatedAt = DateTimeOffset.UtcNow,
            };
            user.PasswordHash = _hasher.HashPassword(user, password);

            context.Users.Add(user);
            await context.SaveChangesAsync();
            return user;
        }

        public async Task<User?> ValidateLoginAsync(string email, string password)
        {
            var user = await context.Users
                .FirstOrDefaultAsync(u => u.Email == email.ToLowerInvariant());
            if (user is null) return null;

            var result = _hasher.VerifyHashedPassword(user, user.PasswordHash, password);
            return result == PasswordVerificationResult.Failed ? null : user;
        }

        public async Task<User?> GetByIdAsync(int userId) =>
            await context.Users.FindAsync(userId);

        public async Task<User?> UpdateProfileAsync(int userId, string displayName, string email, string? avatarUrl)
        {
            var user = await context.Users.FindAsync(userId);
            if (user is null) return null;

            user.DisplayName = displayName;
            user.Email = email.ToLowerInvariant();
            user.AvatarUrl = avatarUrl;
            await context.SaveChangesAsync();
            return user;
        }

        public async Task<bool> ChangePasswordAsync(int userId, string currentPassword, string newPassword)
        {
            var user = await context.Users.FindAsync(userId);
            if (user is null) return false;

            if (_hasher.VerifyHashedPassword(user, user.PasswordHash, currentPassword) == PasswordVerificationResult.Failed)
                return false;

            user.PasswordHash = _hasher.HashPassword(user, newPassword);
            await context.SaveChangesAsync();
            return true;
        }

        public async Task DeleteAccountAsync(int userId)
        {
            var user = await context.Users.FindAsync(userId);
            if (user is not null)
            {
                context.Users.Remove(user);
                await context.SaveChangesAsync();
            }
        }
    }
}

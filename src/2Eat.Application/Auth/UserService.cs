using _2Eat.Domain;
using Microsoft.AspNetCore.Identity;

namespace _2Eat.Application.Auth;

public class UserService(IUserRepository repository) : IUserService
{
    private readonly PasswordHasher<User> _hasher = new();

    public async Task<User?> RegisterAsync(string email, string password, string displayName)
    {
        var emailLower = email.ToLowerInvariant();
        if (await repository.EmailExistsAsync(emailLower))
            return null;

        var user = new User
        {
            Email = emailLower,
            DisplayName = displayName,
            CreatedAt = DateTimeOffset.UtcNow,
        };
        user.PasswordHash = _hasher.HashPassword(user, password);

        return await repository.AddAsync(user);
    }

    public async Task<User?> ValidateLoginAsync(string email, string password)
    {
        var user = await repository.FindByEmailAsync(email.ToLowerInvariant());
        if (user is null) return null;

        var result = _hasher.VerifyHashedPassword(user, user.PasswordHash, password);
        return result == PasswordVerificationResult.Failed ? null : user;
    }

    public Task<User?> GetByIdAsync(int userId) =>
        repository.GetByIdAsync(userId);

    public async Task<User?> UpdateProfileAsync(int userId, string displayName, string email, string? avatarUrl)
    {
        var user = await repository.GetByIdAsync(userId);
        if (user is null) return null;

        user.DisplayName = displayName;
        user.Email = email.ToLowerInvariant();
        user.AvatarUrl = avatarUrl;
        await repository.SaveAsync();
        return user;
    }

    public async Task<bool> ChangePasswordAsync(int userId, string currentPassword, string newPassword)
    {
        var user = await repository.GetByIdAsync(userId);
        if (user is null) return false;

        if (_hasher.VerifyHashedPassword(user, user.PasswordHash, currentPassword) == PasswordVerificationResult.Failed)
            return false;

        user.PasswordHash = _hasher.HashPassword(user, newPassword);
        await repository.SaveAsync();
        return true;
    }

    public async Task DeleteAccountAsync(int userId)
    {
        var user = await repository.GetByIdAsync(userId);
        if (user is not null)
            await repository.RemoveAsync(user);
    }
}

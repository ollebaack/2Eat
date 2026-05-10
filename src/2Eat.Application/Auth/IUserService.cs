using _2Eat.Domain;

namespace _2Eat.Application.Auth;

public interface IUserService
{
    Task<User?> RegisterAsync(string email, string password, string displayName);
    Task<User?> ValidateLoginAsync(string email, string password);
    Task<User?> GetByIdAsync(int userId);
    Task<User?> UpdateProfileAsync(int userId, string displayName, string email, string? avatarUrl);
    Task<bool> ChangePasswordAsync(int userId, string currentPassword, string newPassword);
    Task DeleteAccountAsync(int userId);
}

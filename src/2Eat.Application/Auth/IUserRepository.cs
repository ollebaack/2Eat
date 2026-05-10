using _2Eat.Domain;

namespace _2Eat.Application.Auth;

public interface IUserRepository
{
    Task<bool> EmailExistsAsync(string emailLower);
    Task<User> AddAsync(User user);
    Task<User?> FindByEmailAsync(string emailLower);
    Task<User?> GetByIdAsync(int userId);
    Task SaveAsync();
    Task RemoveAsync(User user);
}

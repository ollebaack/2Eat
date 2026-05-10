namespace _2Eat.Application.Auth.Dtos;

public record RegisterRequest(string Email, string Password, string DisplayName);
public record LoginRequest(string Email, string Password);
public record UpdateProfileRequest(string DisplayName, string Email, string? AvatarUrl);
public record ChangePasswordRequest(string CurrentPassword, string NewPassword);
public record UserDto(int Id, string Email, string DisplayName, string? AvatarUrl);
public record AuthResponse(string Token, UserDto User);

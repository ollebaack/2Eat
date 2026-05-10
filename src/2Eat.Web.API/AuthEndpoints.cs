using _2Eat.Application.Auth;
using _2Eat.Application.Auth.Dtos;
using _2Eat.Domain;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace _2Eat.Web.API
{
    public static class AuthEndpoints
    {
        public static void MapAuthEndpoints(this IEndpointRouteBuilder endpoints)
        {
            var group = endpoints.MapGroup("/api/auth");

            group.MapPost("/register", Register);
            group.MapPost("/login", Login);
            group.MapGet("/me", GetMe).RequireAuthorization();
            group.MapPut("/me", UpdateMe).RequireAuthorization();
            group.MapPut("/me/password", ChangePassword).RequireAuthorization();
            group.MapDelete("/me", DeleteMe).RequireAuthorization();
        }

        static async Task<IResult> Register(RegisterRequest req, IUserService svc, IConfiguration config)
        {
            if (string.IsNullOrWhiteSpace(req.Email) ||
                string.IsNullOrWhiteSpace(req.Password) || req.Password.Length < 8 ||
                string.IsNullOrWhiteSpace(req.DisplayName) || req.DisplayName.Length > 64)
                return Results.BadRequest(new { detail = "Invalid input." });

            var user = await svc.RegisterAsync(req.Email, req.Password, req.DisplayName);
            if (user is null)
                return Results.Conflict(new { detail = "Email already registered." });

            return Results.Created("/api/auth/me", new AuthResponse(GenerateToken(user, config), ToDto(user)));
        }

        static async Task<IResult> Login(LoginRequest req, IUserService svc, IConfiguration config)
        {
            var user = await svc.ValidateLoginAsync(req.Email, req.Password);
            if (user is null) return Results.Unauthorized();
            return Results.Ok(new AuthResponse(GenerateToken(user, config), ToDto(user)));
        }

        static async Task<IResult> GetMe(ClaimsPrincipal principal, IUserService svc)
        {
            var userId = principal.GetUserId();
            if (userId is null) return Results.Unauthorized();
            var user = await svc.GetByIdAsync(userId.Value);
            return user is null ? Results.NotFound() : Results.Ok(ToDto(user));
        }

        static async Task<IResult> UpdateMe(UpdateProfileRequest req, ClaimsPrincipal principal, IUserService svc)
        {
            var userId = principal.GetUserId();
            if (userId is null) return Results.Unauthorized();
            var user = await svc.UpdateProfileAsync(userId.Value, req.DisplayName, req.Email, req.AvatarUrl);
            return user is null ? Results.NotFound() : Results.Ok(ToDto(user));
        }

        static async Task<IResult> ChangePassword(ChangePasswordRequest req, ClaimsPrincipal principal, IUserService svc)
        {
            var userId = principal.GetUserId();
            if (userId is null) return Results.Unauthorized();
            if (string.IsNullOrWhiteSpace(req.NewPassword) || req.NewPassword.Length < 8)
                return Results.BadRequest(new { detail = "New password must be at least 8 characters." });
            var ok = await svc.ChangePasswordAsync(userId.Value, req.CurrentPassword, req.NewPassword);
            return ok ? Results.NoContent() : Results.BadRequest(new { detail = "Current password is incorrect." });
        }

        static async Task<IResult> DeleteMe(ClaimsPrincipal principal, IUserService svc)
        {
            var userId = principal.GetUserId();
            if (userId is null) return Results.Unauthorized();
            await svc.DeleteAccountAsync(userId.Value);
            return Results.NoContent();
        }

        static UserDto ToDto(User user) =>
            new(user.Id, user.Email, user.DisplayName, user.AvatarUrl);

        static string GenerateToken(User user, IConfiguration config)
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(config["Jwt:Secret"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, user.Email),
                new Claim("displayName", user.DisplayName),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            };
            var token = new JwtSecurityToken(
                issuer: config["Jwt:Issuer"],
                audience: config["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(int.Parse(config["Jwt:ExpiresInMinutes"]!)),
                signingCredentials: creds);
            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}

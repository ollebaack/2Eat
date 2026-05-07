using System.Security.Claims;

namespace _2Eat.Web.API
{
    internal static class ClaimsPrincipalExtensions
    {
        internal static int? GetUserId(this ClaimsPrincipal principal)
        {
            var sub = principal.FindFirstValue(ClaimTypes.NameIdentifier)
                   ?? principal.FindFirstValue("sub");
            return int.TryParse(sub, out var id) ? id : null;
        }
    }
}

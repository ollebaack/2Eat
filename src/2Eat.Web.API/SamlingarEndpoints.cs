using System.Security.Claims;
using _2Eat.Application.Samlingar;

namespace _2Eat.Web.API;

public static class SamlingarEndpoints
{
    public static void MapSamlingarEndpoints(this IEndpointRouteBuilder endpoints)
    {
        var group = endpoints.MapGroup("/api/samlingar").RequireAuthorization();
        group.MapGet("/", GetAll);
        group.MapPost("/", Create);
        group.MapGet("/{id}", GetById);
        group.MapPut("/{id}", Rename);
        group.MapDelete("/{id}", Delete);
        group.MapPost("/{id}/recept", AddRecept);
        group.MapDelete("/{id}/recept/{receptId}", RemoveRecept);
        group.MapPut("/{id}/recept/order", UpdateOrder);

        var recipeGroup = endpoints.MapGroup("/api/recipes").RequireAuthorization();
        recipeGroup.MapGet("/{id}/samlingar", GetSamlingarForRecept);
        recipeGroup.MapPut("/{id}/samlingar", SyncReceptMembership);
    }

    static async Task<IResult> GetAll(ClaimsPrincipal principal, ISamlingService service)
    {
        var userId = principal.GetUserId();
        if (userId is null) return Results.Unauthorized();
        var samlingar = await service.GetAllAsync(userId.Value);
        var dtos = samlingar.Select(s => new SamlingListDto(
            s.Id,
            s.Name,
            s.Recept.Count,
            s.Recept.OrderBy(r => r.Order).Take(4).Select(r => r.Recipe.ImageUrl).ToList(),
            s.CreatedAt
        )).ToList();
        return Results.Ok(dtos);
    }

    static async Task<IResult> Create(ClaimsPrincipal principal, ISamlingService service, HttpContext context)
    {
        var userId = principal.GetUserId();
        if (userId is null) return Results.Unauthorized();
        var req = await context.Request.ReadFromJsonAsync<NameRequest>();
        if (req is null || string.IsNullOrWhiteSpace(req.Name))
            return TypedResults.Problem(detail: "Invalid request body.", statusCode: 400);
        var samling = await service.CreateAsync(userId.Value, req.Name.Trim());
        return Results.Ok(new SamlingListDto(samling.Id, samling.Name, 0, [], samling.CreatedAt));
    }

    static async Task<IResult> GetById(int id, ClaimsPrincipal principal, ISamlingService service)
    {
        var userId = principal.GetUserId();
        if (userId is null) return Results.Unauthorized();
        var samling = await service.GetByIdAsync(id, userId.Value);
        if (samling is null) return Results.NotFound();
        var dto = new SamlingDetailDto(
            samling.Id,
            samling.Name,
            samling.CreatedAt,
            samling.Recept.OrderBy(sr => sr.Order).Select(sr => new SamlingReceptDto(
                sr.ReceptId,
                sr.Order,
                sr.Recipe.Name,
                sr.Recipe.ImageUrl,
                sr.Recipe.TotalTime,
                sr.Recipe.Servings,
                sr.Recipe.Rating
            )).ToList()
        );
        return Results.Ok(dto);
    }

    static async Task<IResult> Rename(int id, ClaimsPrincipal principal, ISamlingService service, HttpContext context)
    {
        var userId = principal.GetUserId();
        if (userId is null) return Results.Unauthorized();
        var req = await context.Request.ReadFromJsonAsync<NameRequest>();
        if (req is null || string.IsNullOrWhiteSpace(req.Name))
            return TypedResults.Problem(detail: "Invalid request body.", statusCode: 400);
        var samling = await service.RenameAsync(id, userId.Value, req.Name.Trim());
        return samling is null ? Results.NotFound() : Results.Ok(new SamlingListDto(samling.Id, samling.Name, samling.Recept.Count, [], samling.CreatedAt));
    }

    static async Task<IResult> Delete(int id, ClaimsPrincipal principal, ISamlingService service)
    {
        var userId = principal.GetUserId();
        if (userId is null) return Results.Unauthorized();
        await service.DeleteAsync(id, userId.Value);
        return Results.NoContent();
    }

    static async Task<IResult> AddRecept(int id, ClaimsPrincipal principal, ISamlingService service, HttpContext context)
    {
        var userId = principal.GetUserId();
        if (userId is null) return Results.Unauthorized();
        var req = await context.Request.ReadFromJsonAsync<AddReceptRequest>();
        if (req is null) return TypedResults.Problem(detail: "Invalid request body.", statusCode: 400);
        try
        {
            await service.AddReceptAsync(id, req.ReceptId, userId.Value);
            return Results.NoContent();
        }
        catch (KeyNotFoundException) { return Results.NotFound(); }
    }

    static async Task<IResult> RemoveRecept(int id, int receptId, ClaimsPrincipal principal, ISamlingService service)
    {
        var userId = principal.GetUserId();
        if (userId is null) return Results.Unauthorized();
        try
        {
            await service.RemoveReceptAsync(id, receptId, userId.Value);
            return Results.NoContent();
        }
        catch (KeyNotFoundException) { return Results.NotFound(); }
    }

    static async Task<IResult> UpdateOrder(int id, ClaimsPrincipal principal, ISamlingService service, HttpContext context)
    {
        var userId = principal.GetUserId();
        if (userId is null) return Results.Unauthorized();
        var req = await context.Request.ReadFromJsonAsync<UpdateOrderRequest>();
        if (req is null) return TypedResults.Problem(detail: "Invalid request body.", statusCode: 400);
        try
        {
            await service.UpdateOrderAsync(id, userId.Value, req.ReceptIds);
            return Results.NoContent();
        }
        catch (KeyNotFoundException) { return Results.NotFound(); }
    }

    static async Task<IResult> GetSamlingarForRecept(int id, ClaimsPrincipal principal, ISamlingService service)
    {
        var userId = principal.GetUserId();
        if (userId is null) return Results.Unauthorized();
        var ids = await service.GetSamlingarForReceptAsync(id, userId.Value);
        return Results.Ok(new { samlingIds = ids });
    }

    static async Task<IResult> SyncReceptMembership(int id, ClaimsPrincipal principal, ISamlingService service, HttpContext context)
    {
        var userId = principal.GetUserId();
        if (userId is null) return Results.Unauthorized();
        var req = await context.Request.ReadFromJsonAsync<SyncMembershipRequest>();
        if (req is null) return TypedResults.Problem(detail: "Invalid request body.", statusCode: 400);
        await service.SyncReceptMembershipAsync(id, userId.Value, req.SamlingIds);
        return Results.NoContent();
    }

    record SamlingListDto(int Id, string Name, int ReceptCount, List<string?> CoverImages, DateTimeOffset CreatedAt);
    record SamlingDetailDto(int Id, string Name, DateTimeOffset CreatedAt, List<SamlingReceptDto> Recept);
    record SamlingReceptDto(int ReceptId, int Order, string Name, string? ImageUrl, int TotalTime, int Servings, int Rating);
    record NameRequest(string Name);
    record AddReceptRequest(int ReceptId);
    record UpdateOrderRequest(List<int> ReceptIds);
    record SyncMembershipRequest(List<int> SamlingIds);
}

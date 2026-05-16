namespace _2Eat.Application;

public record PagedResult<T>(List<T> Items, bool HasMore, int Page);

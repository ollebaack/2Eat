using _2Eat.Domain;

namespace _2Eat.Application.Pantry;

public interface IPantryItemService
{
    Task<List<PantryItem>> GetAllAsync(int userId);
    Task<PantryItem> CreateAsync(int userId, PantryItem item);
    Task<PantryItem> UpdateAsync(int userId, int id, PantryItem item);
    Task DeleteAsync(int userId, int id);
}

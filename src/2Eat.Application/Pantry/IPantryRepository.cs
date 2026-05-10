using _2Eat.Domain;

namespace _2Eat.Application.Pantry;

public interface IPantryRepository
{
    Task<List<PantryItem>> GetByUserAsync(int userId);
    Task<PantryItem> AddAsync(PantryItem item);
    Task<PantryItem?> FindAsync(int id, int userId);
    Task SaveAsync();
    Task RemoveAsync(PantryItem item);
}

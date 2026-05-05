using _2Eat.Domain;

namespace _2Eat.Infrastructure.Services.PantryServices
{
    public interface IPantryItemService
    {
        Task<List<PantryItem>> GetAllAsync();
        Task<PantryItem> CreateAsync(PantryItem item);
        Task<PantryItem> UpdateAsync(int id, PantryItem item);
        Task DeleteAsync(int id);
    }
}

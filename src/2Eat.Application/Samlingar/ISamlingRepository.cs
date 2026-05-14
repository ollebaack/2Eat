using _2Eat.Domain;

namespace _2Eat.Application.Samlingar;

public interface ISamlingRepository
{
    Task<List<Samling>> GetByUserAsync(int userId);
    Task<Samling?> GetByIdAsync(int samlingId, int userId);
    Task<Samling> AddAsync(Samling samling);
    Task RemoveAsync(Samling samling);
    Task<SamlingRecept?> FindReceptAsync(int samlingId, int receptId);
    Task AddReceptAsync(SamlingRecept samlingRecept);
    Task RemoveReceptAsync(SamlingRecept samlingRecept);
    Task<int> GetMaxOrderAsync(int samlingId);
    Task UpdateOrdersAsync(int samlingId, List<int> orderedReceptIds);
    Task<List<int>> GetUserSamlingIdsForReceptAsync(int receptId, int userId);
    Task SaveAsync();
}

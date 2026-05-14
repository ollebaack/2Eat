using _2Eat.Domain;

namespace _2Eat.Application.Samlingar;

public interface ISamlingService
{
    Task<List<Samling>> GetAllAsync(int userId);
    Task<Samling?> GetByIdAsync(int samlingId, int userId);
    Task<Samling> CreateAsync(int userId, string name);
    Task<Samling?> RenameAsync(int samlingId, int userId, string name);
    Task DeleteAsync(int samlingId, int userId);
    Task AddReceptAsync(int samlingId, int receptId, int userId);
    Task RemoveReceptAsync(int samlingId, int receptId, int userId);
    Task UpdateOrderAsync(int samlingId, int userId, List<int> orderedReceptIds);
    Task<List<int>> GetSamlingarForReceptAsync(int receptId, int userId);
    Task SyncReceptMembershipAsync(int receptId, int userId, List<int> samlingIds);
}

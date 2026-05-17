using _2Eat.Domain;

namespace _2Eat.Application.Utforska;

public interface IForslagRepository
{
    /// <summary>Returns up to <paramref name="count"/> Förslag the user has not yet seen.</summary>
    Task<List<Forslag>> GetUnseenAsync(int userId, int count, CancellationToken ct = default);

    /// <summary>Returns all Förslag the user has not yet seen, including ingredient names. Does not mark as seen.</summary>
    Task<List<Forslag>> GetAllUnseenAsync(int userId, CancellationToken ct = default);

    /// <summary>Total number of Förslag in the shared pool.</summary>
    Task<int> TotalCountAsync(CancellationToken ct = default);

    /// <summary>Number of Förslag the user has not yet seen.</summary>
    Task<int> GetUnseenCountAsync(int userId, CancellationToken ct = default);

    Task<Forslag?> GetByIdAsync(int id, CancellationToken ct = default);

    /// <summary>Mark the given Förslag IDs as seen for this user.</summary>
    Task MarkSeenAsync(int userId, IEnumerable<int> forslagIds, CancellationToken ct = default);

    /// <summary>Clear all seen records for this user (cursor reset).</summary>
    Task ResetSeenAsync(int userId, CancellationToken ct = default);

    /// <summary>
    /// Replace all Förslag from <paramref name="sourceSite"/> with fresh ones.
    /// Automatically cascade-deletes any UserForslag rows for the removed items.
    /// </summary>
    Task ReplaceBySourceAsync(string sourceSite, IEnumerable<Forslag> incoming, CancellationToken ct = default);

}

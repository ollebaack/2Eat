using _2Eat.Domain;

namespace _2Eat.Application.Utforska;

public interface IForslagService
{
    /// <summary>
    /// Returns the next 10 unseen Förslag for the user, marking them as seen.
    /// Resets the seen cursor automatically when the pool is exhausted.
    /// </summary>
    Task<List<Forslag>> GetNextAsync(int userId, CancellationToken ct = default);

    /// <summary>
    /// Returns all unseen Förslag with ingredient names. Does not advance the seen cursor.
    /// Used for client-side Skafferi scoring in the "Från skafferiet" filter.
    /// </summary>
    Task<List<Forslag>> GetAllUnseenAsync(int userId, CancellationToken ct = default);

    Task<Forslag?> GetByIdAsync(int id, CancellationToken ct = default);

    /// <summary>
    /// Refreshes the shared Förslag pool from all configured sources.
    /// When <paramref name="waitForLock"/> is true the call blocks until any
    /// in-progress background refresh finishes before acquiring the lock itself.
    /// Background callers should use the default (false) so they skip rather than queue.
    /// </summary>
    Task<(bool Refreshed, string Message)> RefreshPoolAsync(bool waitForLock = false, CancellationToken ct = default);
}

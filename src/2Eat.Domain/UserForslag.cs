namespace _2Eat.Domain;

/// <summary>
/// Tracks which Förslag have been shown to a user (their "seen cursor").
/// When a user has seen all Förslag, this table is cleared and they start fresh.
/// </summary>
public class UserForslag
{
    public int UserId { get; set; }
    public int ForslagId { get; set; }
    public Forslag Forslag { get; set; } = null!;
    public DateTimeOffset SeenAt { get; set; } = DateTimeOffset.UtcNow;
}

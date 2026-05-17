namespace _2Eat.Domain;

/// <summary>
/// A lightweight recipe discovery card sourced from an external website.
/// Not owned by any user — lives in a shared pool.
/// Becomes a Recept only when a user fast-adds it.
/// </summary>
public class Forslag
{
    public int Id { get; set; }
    public string Title { get; set; } = null!;
    public string? ImageUrl { get; set; }
    public string SourceUrl { get; set; } = null!;

    /// <summary>e.g. "ICA", "Köket", "Coop"</summary>
    public string SourceSite { get; set; } = null!;

    public DateTimeOffset FetchedAt { get; set; } = DateTimeOffset.UtcNow;

    public ICollection<ForslagIngredientName> IngredientNames { get; set; } = new List<ForslagIngredientName>();
}

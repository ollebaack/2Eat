namespace _2Eat.Domain;

public class Samling
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string Name { get; set; } = null!;
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public ICollection<SamlingRecept> Recept { get; set; } = new List<SamlingRecept>();
}

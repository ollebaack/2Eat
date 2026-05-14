namespace _2Eat.Domain;

public class SamlingRecept
{
    public int SamlingId { get; set; }
    public Samling Samling { get; set; } = null!;
    public int ReceptId { get; set; }
    public Recipe Recipe { get; set; } = null!;
    public int Order { get; set; }
}

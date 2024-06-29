namespace _2Eat.Domain
{
    public class Receipy
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public ICollection<Ingredient> Ingredients { get; set; }
        public string Instructions { get; set; }
    }
}
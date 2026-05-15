using _2Eat.Domain;

namespace _2Eat.Application.Pantry;

public interface ITextParsePantryService
{
    Task<List<ScannedItem>> ParseTextAsync(string text);
}

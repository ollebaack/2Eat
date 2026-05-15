using System.Text.Json;
using _2Eat.Application.Pantry;
using _2Eat.Domain;
using Anthropic.SDK;
using Anthropic.SDK.Constants;
using Anthropic.SDK.Messaging;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace _2Eat.Infrastructure.Pantry;

public class TextParsePantryClient(IConfiguration config, ILogger<TextParsePantryClient> logger)
    : ITextParsePantryService
{
    private const string ParsePrompt = """
        You are a pantry item parser. The user has listed food items they have at home.

        Return ONLY a JSON array with no markdown, no explanation, no code fences. Each element must have exactly these fields:
        - "name": string (in Swedish if visible, otherwise translate to Swedish)
        - "category": string (must be exactly one of: Skafferi, Kyl, Frys, Grönsaker, Krydda, Mejeri, Frukt)
        - "quantity": number (default 1 if unclear)
        - "unit": string (use: st, g, kg, l, dl, ml — default "st" if unclear)

        Category rules:
        - Kyl: refrigerated items (fresh meat, deli, eggs, chilled drinks)
        - Frys: frozen items
        - Grönsaker: fresh vegetables
        - Frukt: fresh fruit and berries
        - Mejeri: milk, yoghurt, cheese, butter, cream
        - Krydda: spices, herbs, condiments, sauces, oils, vinegar
        - Skafferi: everything else (pasta, rice, canned goods, bread, snacks, beverages)

        If no food items are found, return: []

        Example: [{"name":"Mjölk","category":"Mejeri","quantity":1,"unit":"l"},{"name":"Ägg","category":"Kyl","quantity":6,"unit":"st"}]

        Items to parse:
        """;

    private static readonly JsonSerializerOptions JsonOptions = new() { PropertyNameCaseInsensitive = true };

    public async Task<List<ScannedItem>> ParseTextAsync(string text)
    {
        var apiKey = config["Anthropic:ApiKey"];
        if (string.IsNullOrWhiteSpace(apiKey))
            return FallbackParse(text);

        var client = new AnthropicClient(apiKey);
        var messages = new List<Message>
        {
            new()
            {
                Role = RoleType.User,
                Content = new List<ContentBase>
                {
                    new TextContent { Text = ParsePrompt + text }
                }
            }
        };

        var parameters = new MessageParameters
        {
            Model = AnthropicModels.Claude45Haiku,
            MaxTokens = 1024,
            Stream = false,
            Messages = messages,
        };

        try
        {
            var response = await client.Messages.GetClaudeMessageAsync(parameters);
            var raw = response.Message.ToString() ?? "[]";
            var start = raw.IndexOf('[');
            var end = raw.LastIndexOf(']');
            var json = start >= 0 && end > start ? raw[start..(end + 1)] : "[]";
            var result = JsonSerializer.Deserialize<List<ScannedItem>>(json, JsonOptions);
            return result is { Count: > 0 } ? result : FallbackParse(text);
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Text parse failed, using fallback");
            return FallbackParse(text);
        }
    }

    private static List<ScannedItem> FallbackParse(string text) =>
        text.Split([',', '\n', '\r'], StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .Where(s => !string.IsNullOrWhiteSpace(s))
            .Select(s => new ScannedItem { Name = s, Category = "Skafferi", Quantity = 1, Unit = "st" })
            .ToList();
}

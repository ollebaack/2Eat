using System.Text.Json;
using _2Eat.Domain;
using Anthropic.SDK;
using Anthropic.SDK.Constants;
using Anthropic.SDK.Messaging;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace _2Eat.Infrastructure.Services.ReceiptScanServices;

public class ReceiptScanService(IConfiguration config, ILogger<ReceiptScanService> logger)
    : IReceiptScanService
{
    private const string ReceiptPrompt = """
        You are a grocery receipt parser. Analyze the receipt image and extract every food/grocery item purchased.

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

        If the image is not a receipt or no food items are found, return: []

        Example: [{"name":"Mjölk","category":"Mejeri","quantity":1,"unit":"l"},{"name":"Ägg","category":"Kyl","quantity":6,"unit":"st"}]
        """;

    private static readonly JsonSerializerOptions JsonOptions = new() { PropertyNameCaseInsensitive = true };

    public async Task<List<ScannedItem>> ScanReceiptAsync(byte[] imageBytes, string mimeType)
    {
        var apiKey = config["Anthropic:ApiKey"];
        if (string.IsNullOrWhiteSpace(apiKey))
            throw new InvalidOperationException("Anthropic:ApiKey is not configured.");

        var client = new AnthropicClient(apiKey);

        var messages = new List<Message>
        {
            new()
            {
                Role = RoleType.User,
                Content = new List<ContentBase>
                {
                    new ImageContent
                    {
                        Source = new ImageSource
                        {
                            MediaType = mimeType,
                            Data = Convert.ToBase64String(imageBytes),
                        }
                    },
                    new TextContent { Text = ReceiptPrompt }
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
            var text = response.Message.ToString() ?? "[]";
            var start = text.IndexOf('[');
            var end = text.LastIndexOf(']');
            var json = start >= 0 && end > start ? text[start..(end + 1)] : "[]";
            return JsonSerializer.Deserialize<List<ScannedItem>>(json, JsonOptions) ?? [];
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Receipt scan failed");
            return [];
        }
    }
}

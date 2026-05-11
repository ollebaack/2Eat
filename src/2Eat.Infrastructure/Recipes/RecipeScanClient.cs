using Anthropic.SDK;
using Anthropic.SDK.Constants;
using Anthropic.SDK.Messaging;
using _2Eat.Application.Recipes;
using _2Eat.Application.Recipes.Dtos;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Text.Json;
using System.Text.RegularExpressions;

namespace _2Eat.Infrastructure.Recipes;

public class RecipeScanClient : IRecipeScanService
{
    private readonly AnthropicClient? _client;
    private readonly IHttpClientFactory _httpFactory;
    private readonly ILogger<RecipeScanClient> _logger;

    public bool IsConfigured => _client is not null;

    public RecipeScanClient(IConfiguration config, IHttpClientFactory httpFactory, ILogger<RecipeScanClient> logger)
    {
        _httpFactory = httpFactory;
        _logger = logger;
        var apiKey = config["Anthropic:ApiKey"];
        if (!string.IsNullOrWhiteSpace(apiKey))
            _client = new AnthropicClient(apiKey);
    }

    public async Task<ScannedRecipeDto> ScanFromImageAsync(Stream imageStream, string contentType, CancellationToken ct = default)
    {
        EnsureConfigured();

        using var ms = new MemoryStream();
        await imageStream.CopyToAsync(ms, ct);
        var base64 = Convert.ToBase64String(ms.ToArray());

        var messages = new List<Message>
        {
            new Message
            {
                Role = RoleType.User,
                Content = new List<ContentBase>
                {
                    new ImageContent
                    {
                        Source = new ImageSource
                        {
                            MediaType = contentType,
                            Data = base64
                        }
                    },
                    new TextContent { Text = ExtractionPrompt() }
                }
            }
        };

        return await CallClaude(messages, ct);
    }

    public async Task<ScannedRecipeDto> ScanFromUrlAsync(string url, CancellationToken ct = default)
    {
        var http = _httpFactory.CreateClient("RecipeScan");
        var html = await http.GetStringAsync(url, ct);

        var scraped = JsonLdRecipeScraper.TryScrape(html);
        if (scraped is not null)
        {
            _logger.LogInformation("Recipe extracted via JSON-LD scraping from {Url}", url);
            return scraped;
        }

        // Fall back to AI when no structured data is found
        EnsureConfigured();
        var text = StripHtml(html);
        if (text.Length > 80_000) text = text[..80_000];

        var messages = new List<Message>
        {
            new Message(RoleType.User, $"Extract a recipe from this web page content.\n\n{ExtractionPrompt()}\n\nPage content:\n{text}")
        };

        return await CallClaude(messages, ct);
    }

    private async Task<ScannedRecipeDto> CallClaude(List<Message> messages, CancellationToken ct)
    {
        var parameters = new MessageParameters
        {
            Model = AnthropicModels.Claude45Haiku,
            MaxTokens = 2048,
            Messages = messages,
            System = new List<SystemMessage>
            {
                new SystemMessage("You are a recipe extraction assistant. Always respond with valid JSON only — no markdown fences, no explanation, just the raw JSON object.")
            }
        };

        try
        {
            var response = await _client!.Messages.GetClaudeMessageAsync(parameters, ct);
            var json = response.Message.ToString();
            return ParseResponse(json);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Recipe scan failed");
            throw;
        }
    }

    private static string ExtractionPrompt() => """
        Extract all recipe information and return ONLY a JSON object with this exact shape:
        {
          "name": "string or null",
          "description": "string or null",
          "steps": ["step 1 text", "step 2 text"],
          "servings": number or null,
          "prepTime": minutes as number or null,
          "cookTime": minutes as number or null,
          "difficulty": "Lätt" or "Medel" or "Svår" or null,
          "ingredients": [
            { "name": "string", "quantity": number, "unit": "g|ml|kg|krm|tsk|msk|dl|l|kaffemått|st|cup|floz|oz|lbs|cl|pinch|tsp|tbsp" }
          ]
        }
        Use the exact unit from the list — do not convert; pick the closest match.
        If a field cannot be determined, use null. Do not include any text outside the JSON.
        """;

    private static readonly JsonSerializerOptions JsonOptions = new() { PropertyNameCaseInsensitive = true };

    private static ScannedRecipeDto ParseResponse(string json)
    {
        var trimmed = json.Trim();
        if (trimmed.StartsWith("```"))
        {
            var first = trimmed.IndexOf('\n');
            var last = trimmed.LastIndexOf("```");
            if (first >= 0 && last > first)
                trimmed = trimmed[(first + 1)..last].Trim();
        }

        return JsonSerializer.Deserialize<ScannedRecipeDto>(trimmed, JsonOptions)
            ?? throw new InvalidOperationException("Claude returned an empty response.");
    }

    private static string StripHtml(string html)
    {
        var noTags = Regex.Replace(html, "<[^>]+>", " ");
        return Regex.Replace(noTags, @"\s{2,}", " ").Trim();
    }

    private void EnsureConfigured()
    {
        if (_client is null)
            throw new InvalidOperationException("Anthropic API key is not configured.");
    }
}

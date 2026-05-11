using System.Globalization;
using System.Text.Json;
using System.Text.RegularExpressions;
using System.Xml;
using _2Eat.Application.Recipes.Dtos;

namespace _2Eat.Infrastructure.Recipes;

internal static partial class JsonLdRecipeScraper
{
    // Ordered longest-first so shorter units don't shadow longer ones in the alternation
    private static readonly string[] Units =
    [
        "kaffemått", "krm", "tsk", "msk", "floz", "lbs", "pinch", "tbsp", "tsp", "cup",
        "cl", "dl", "ml", "kg", "oz", "st", "l", "g"
    ];

    public static ScannedRecipeDto? TryScrape(string html)
    {
        foreach (Match match in LdJsonPattern().Matches(html))
        {
            try
            {
                using var doc = JsonDocument.Parse(match.Groups[1].Value);
                var recipe = FindRecipeElement(doc.RootElement);
                if (recipe is not null)
                    return MapToDto(recipe.Value);
            }
            catch (JsonException) { }
        }

        return null;
    }

    private static JsonElement? FindRecipeElement(JsonElement el)
    {
        if (el.ValueKind == JsonValueKind.Array)
        {
            foreach (var item in el.EnumerateArray())
            {
                var found = FindRecipeElement(item);
                if (found is not null) return found;
            }
            return null;
        }

        if (el.ValueKind != JsonValueKind.Object)
            return null;

        if (IsRecipeType(el)) return el;

        // Some sites wrap everything in @graph
        if (el.TryGetProperty("@graph", out var graph))
            return FindRecipeElement(graph);

        return null;
    }

    private static bool IsRecipeType(JsonElement el)
    {
        if (!el.TryGetProperty("@type", out var typeProp)) return false;

        if (typeProp.ValueKind == JsonValueKind.String)
            return typeProp.GetString() == "Recipe";

        if (typeProp.ValueKind == JsonValueKind.Array)
        {
            foreach (var t in typeProp.EnumerateArray())
                if (t.GetString() == "Recipe") return true;
        }

        return false;
    }

    private static ScannedRecipeDto MapToDto(JsonElement r) => new(
        Name: GetString(r, "name"),
        Description: GetString(r, "description"),
        Steps: GetSteps(r),
        Servings: GetServings(r),
        PrepTime: GetDurationMinutes(r, "prepTime"),
        CookTime: GetDurationMinutes(r, "cookTime"),
        Difficulty: null,
        Ingredients: GetIngredients(r)
    );

    private static string? GetString(JsonElement el, string prop)
    {
        if (!el.TryGetProperty(prop, out var val)) return null;
        return val.ValueKind == JsonValueKind.String ? val.GetString() : null;
    }

    private static string[]? GetSteps(JsonElement r)
    {
        if (!r.TryGetProperty("recipeInstructions", out var instr)) return null;

        var steps = new List<string>();
        CollectStepTexts(instr, steps);
        return steps.Count > 0 ? steps.ToArray() : null;
    }

    private static void CollectStepTexts(JsonElement el, List<string> steps)
    {
        switch (el.ValueKind)
        {
            case JsonValueKind.String:
                var s = el.GetString();
                if (!string.IsNullOrWhiteSpace(s)) steps.Add(s);
                break;

            case JsonValueKind.Array:
                foreach (var item in el.EnumerateArray())
                    CollectStepTexts(item, steps);
                break;

            case JsonValueKind.Object:
                // HowToStep has "text"; HowToSection has "itemListElement"
                if (el.TryGetProperty("text", out var text))
                    CollectStepTexts(text, steps);
                else if (el.TryGetProperty("itemListElement", out var list))
                    CollectStepTexts(list, steps);
                break;
        }
    }

    private static int? GetServings(JsonElement r)
    {
        if (!r.TryGetProperty("recipeYield", out var yield)) return null;

        if (yield.ValueKind == JsonValueKind.Number)
            return yield.GetInt32();

        var raw = yield.ValueKind switch
        {
            JsonValueKind.String => yield.GetString(),
            JsonValueKind.Array  => GetFirstStringOrNumber(yield),
            _                    => null
        };

        if (raw is null) return null;
        var m = Regex.Match(raw, @"\d+");
        return m.Success ? int.Parse(m.Value) : null;
    }

    private static string? GetFirstStringOrNumber(JsonElement arr)
    {
        foreach (var item in arr.EnumerateArray())
        {
            if (item.ValueKind == JsonValueKind.String) return item.GetString();
            if (item.ValueKind == JsonValueKind.Number) return item.GetRawText();
        }
        return null;
    }

    private static int? GetDurationMinutes(JsonElement r, string prop)
    {
        if (!r.TryGetProperty(prop, out var val)) return null;
        if (val.ValueKind != JsonValueKind.String) return null;

        var iso = val.GetString();
        if (string.IsNullOrWhiteSpace(iso)) return null;

        try { return (int)XmlConvert.ToTimeSpan(iso).TotalMinutes; }
        catch { return null; }
    }

    private static ScannedIngredientDto[]? GetIngredients(JsonElement r)
    {
        if (!r.TryGetProperty("recipeIngredient", out var list) ||
            list.ValueKind != JsonValueKind.Array)
            return null;

        var result = new List<ScannedIngredientDto>();
        foreach (var item in list.EnumerateArray())
        {
            if (item.ValueKind != JsonValueKind.String) continue;
            var raw = item.GetString()?.Trim();
            if (!string.IsNullOrWhiteSpace(raw))
                result.Add(ParseIngredient(raw));
        }

        return result.Count > 0 ? result.ToArray() : null;
    }

    private static ScannedIngredientDto ParseIngredient(string raw)
    {
        // Normalize unicode fractions and slash notation
        raw = raw
            .Replace("½", "0.5").Replace("¼", "0.25")
            .Replace("¾", "0.75").Replace("⅓", "0.33")
            .Replace("⅔", "0.67");
        raw = SlashFraction().Replace(raw, m =>
        {
            var n = double.Parse(m.Groups[1].Value, CultureInfo.InvariantCulture);
            var d = double.Parse(m.Groups[2].Value, CultureInfo.InvariantCulture);
            return (n / d).ToString("G", CultureInfo.InvariantCulture);
        });

        var unitPattern = string.Join("|", Units.Select(Regex.Escape));
        var match = Regex.Match(raw.Trim(),
            $@"^([\d.,]+)?\s*({unitPattern})?\s*(.+)?$",
            RegexOptions.IgnoreCase);

        double quantity = 0;
        var unit = "st";
        var name = raw.Trim();

        if (match.Success)
        {
            if (match.Groups[1].Success &&
                double.TryParse(match.Groups[1].Value.Replace(',', '.'),
                    NumberStyles.Any, CultureInfo.InvariantCulture, out var q))
                quantity = q;

            if (match.Groups[2].Success && !string.IsNullOrWhiteSpace(match.Groups[2].Value))
                unit = match.Groups[2].Value.ToLowerInvariant();

            if (match.Groups[3].Success && !string.IsNullOrWhiteSpace(match.Groups[3].Value))
                name = match.Groups[3].Value.Trim();
        }

        return new ScannedIngredientDto(name, quantity, unit);
    }

    [GeneratedRegex(@"<script[^>]+type=[""']application/ld\+json[""'][^>]*>([\s\S]*?)</script>", RegexOptions.IgnoreCase)]
    private static partial Regex LdJsonPattern();

    [GeneratedRegex(@"(\d+)/(\d+)")]
    private static partial Regex SlashFraction();
}

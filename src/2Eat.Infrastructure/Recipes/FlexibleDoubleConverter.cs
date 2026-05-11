using System.Text.Json;
using System.Text.Json.Serialization;

namespace _2Eat.Infrastructure.Recipes;

internal sealed class FlexibleDoubleConverter : JsonConverter<double?>
{
    private static readonly Dictionary<char, double> UnicodeFractions = new()
    {
        { '½', 0.5 },   { '¼', 0.25 },  { '¾', 0.75 },
        { '⅓', 1.0/3 }, { '⅔', 2.0/3 }, { '⅕', 0.2 },
        { '⅖', 0.4 },   { '⅗', 0.6 },   { '⅘', 0.8 },
        { '⅙', 1.0/6 }, { '⅚', 5.0/6 }, { '⅛', 0.125 },
        { '⅜', 0.375 }, { '⅝', 0.625 }, { '⅞', 0.875 },
    };

    public override double? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options) =>
        reader.TokenType switch
        {
            JsonTokenType.Null => null,
            JsonTokenType.Number => reader.GetDouble(),
            JsonTokenType.String => ParseString(reader.GetString()),
            _ => throw new JsonException($"Cannot convert {reader.TokenType} to double.")
        };

    public override void Write(Utf8JsonWriter writer, double? value, JsonSerializerOptions options)
    {
        if (value is null) writer.WriteNullValue();
        else writer.WriteNumberValue(value.Value);
    }

    private static double? ParseString(string? s)
    {
        if (string.IsNullOrWhiteSpace(s)) return null;
        s = s.Trim();

        // Single unicode fraction char: "½"
        if (s.Length == 1 && UnicodeFractions.TryGetValue(s[0], out var f)) return f;

        // Whole number + unicode fraction: "1½" or "1 ½"
        if (UnicodeFractions.TryGetValue(s[^1], out var uf))
        {
            var prefix = s[..^1].Trim();
            if (double.TryParse(prefix, System.Globalization.NumberStyles.Any,
                System.Globalization.CultureInfo.InvariantCulture, out var w))
                return w + uf;
        }

        // Slash fractions: "1/2" or mixed "1 1/2"
        var slash = s.IndexOf('/');
        if (slash > 0)
        {
            var space = s.IndexOf(' ');
            double whole = 0;
            var fracPart = s;

            if (space > 0 && space < slash &&
                double.TryParse(s[..space].Trim(), System.Globalization.NumberStyles.Any,
                    System.Globalization.CultureInfo.InvariantCulture, out whole))
                fracPart = s[(space + 1)..].Trim();

            var fslash = fracPart.IndexOf('/');
            if (fslash > 0 &&
                double.TryParse(fracPart[..fslash].Trim(), System.Globalization.NumberStyles.Any,
                    System.Globalization.CultureInfo.InvariantCulture, out var num) &&
                double.TryParse(fracPart[(fslash + 1)..].Trim(), System.Globalization.NumberStyles.Any,
                    System.Globalization.CultureInfo.InvariantCulture, out var den) && den != 0)
                return whole + num / den;
        }

        return double.TryParse(s, System.Globalization.NumberStyles.Any,
            System.Globalization.CultureInfo.InvariantCulture, out var v) ? v : null;
    }
}

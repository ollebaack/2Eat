namespace _2Eat.Application.Extensions.MarkupExtension;

using Microsoft.AspNetCore.Components;
using System.Web;
public static class MarkupExtension
{
    public static MarkupString AsMarkup(this string s)
    {
        return (MarkupString)s;
    }

    public static string AsHtml(this string text)
    {
        text = HttpUtility.HtmlEncode(text);
        text = text.Replace("\r\n", "\r");
        text = text.Replace("\n", "\r");
        text = text.Replace("\r", "<br>\r\n");
        text = text.Replace("  ", " &nbsp;");
        return text;
    }
}
using Microsoft.Extensions.Logging;
using _2Eat.Application.Services;
using _2Eat.WebUI.App.Services;
using _2Eat.Application;
using _2Eat.Infrastructure;
using Radzen;

namespace _2Eat.WebUI.App;

public static class MauiProgram
{
    public static MauiApp CreateMauiApp()
    {
        var builder = MauiApp.CreateBuilder();
        builder
            .UseMauiApp<App>()
            .ConfigureFonts(fonts =>
            {
                fonts.AddFont("OpenSans-Regular.ttf", "OpenSansRegular");
            });

        builder.Services.AddRadzenComponents();
        
        builder.Services.AddApplicationExtensions();
        builder.Services.AddInfrastructureExtensions(builder.Configuration);

        // Add device-specific services used by the _2Eat.WebUI.Shared project
        builder.Services.AddSingleton<IFormFactor, FormFactor>();

        builder.Services.AddMauiBlazorWebView();

#if DEBUG
        builder.Services.AddBlazorWebViewDeveloperTools();
        builder.Logging.AddDebug();
#endif

        return builder.Build();
    }
}

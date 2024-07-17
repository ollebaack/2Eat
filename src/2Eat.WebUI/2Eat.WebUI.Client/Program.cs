using _2Eat.Infrastructure;
using Microsoft.AspNetCore.Components.WebAssembly.Hosting;

var builder = WebAssemblyHostBuilder.CreateDefault(args);

//builder.Services.AddApplicationExtensions();
builder.AddClientInfrastructureExtensions();

await builder.Build().RunAsync();
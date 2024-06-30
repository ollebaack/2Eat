using Microsoft.AspNetCore.Components.WebAssembly.Hosting;
using _2Eat.Application;
using _2Eat.Infrastructure;
using Microsoft.Extensions.Configuration;

var builder = WebAssemblyHostBuilder.CreateDefault(args);

//builder.Services.AddApplicationExtensions();
builder.AddClientInfrastructureExtensions();

await builder.Build().RunAsync();

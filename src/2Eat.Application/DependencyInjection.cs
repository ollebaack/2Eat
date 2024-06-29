using Microsoft.Extensions.DependencyInjection;

namespace _2Eat.Application
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddApplicationExtensions(this IServiceCollection services)
        {
            //services.AddScoped<ITodoService, TodoService>();
            return services;
        }
    }
}

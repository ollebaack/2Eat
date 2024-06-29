using Microsoft.Extensions.DependencyInjection;

namespace _2Eat.Infrastructure
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddInfrastructure(this IServiceCollection services)
        {
            //services.AddEntityFramework();
            return services;
        }
    }
}

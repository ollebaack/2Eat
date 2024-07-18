
namespace _2Eat.Application.Services.ClientServices
{
    public interface IClient
    {
        Task<TResult> CreateAsync<TResult, TEntity>(TEntity entity);
        Task<TResult> DeleteAsync<TResult>(int id);
        Task<List<TResult>> GetAsync<TResult>();
        Task<TResult> GetByIdAsync<TResult>(int id);
        Task<TResult> GetByNameAsync<TResult>(string name);
        Task<TResult> UpdateAsync<TResult, TEntity>(int id, TEntity entity);
        void SetEntityEndpoint(string entity);
    }
}
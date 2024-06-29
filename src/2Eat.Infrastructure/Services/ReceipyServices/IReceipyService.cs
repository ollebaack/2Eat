using _2Eat.Domain;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace _2Eat.Infrastructure.Services.ReceipyServices
{
    public interface IReceipyService
    {
        Task<List<Domain.Receipy>> GetRecepiesAsync();
        Task<Domain.Receipy> GetReceipyByIdAsync(int id);
        Task<Domain.Receipy> AddReceipyAsync(Receipy receipy);
        Task<Domain.Receipy> UpdateReceipyAsync(int Id, Receipy receipy);
    }
}

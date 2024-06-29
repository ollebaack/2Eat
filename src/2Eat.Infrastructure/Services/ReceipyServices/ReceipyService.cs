using _2Eat.Domain;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace _2Eat.Infrastructure.Services.ReceipyServices
{
    public class ReceipyService(ApplicationDbContext context) : IReceipyService
    {
        private readonly ApplicationDbContext _context = context;

        public Task<Domain.Receipy> AddReceipyAsync(Receipy receipy)
        {
            var receipyEntity = new Receipy
            {
                Name = receipy.Name,
                Ingredients = receipy.Ingredients,
                Instructions = receipy.Instructions
            };
            return Task.FromResult(receipyEntity);
        }

        public Task<Receipy> GetReceipyByIdAsync(int id)
        {
            throw new NotImplementedException();
        }

        public async Task<List<Domain.Receipy>> GetRecepiesAsync()
        {
            await Task.Delay(1000);

            var testReceipies = new List<Receipy>
            {
                new() { Id = 1, Name = "Test Receipy1", Ingredients = [new Ingredient() { Name = "Flower"}, new Ingredient() { Name = "Sugar"}], Instructions = "Test Instructions"},
                new() { Id = 2, Name = "Test Receipy2", Ingredients = [new Ingredient() { Name = "Flower"}, new Ingredient() { Name = "Sugar"}], Instructions = "Test Instructions"},
                new() { Id = 3, Name = "Test Receipy3", Ingredients = [new Ingredient() { Name = "Flower"}, new Ingredient() { Name = "Sugar"}], Instructions = "Test Instructions"},
                new() { Id = 4, Name = "Test Receipy4", Ingredients = [new Ingredient() { Name = "Flower"}, new Ingredient() { Name = "Sugar"}], Instructions = "Test Instructions"},
            };
            //var receipies = await _context.Receipies.ToListAsync();
            var receipies = testReceipies;


            return receipies;
        }

        public Task<Receipy> UpdateReceipyAsync(int Id, Receipy receipy)
        {
            var receipyEntity = new Receipy
            {
                Id = Id,
                Name = receipy.Name,
                Ingredients = receipy.Ingredients,
                Instructions = receipy.Instructions
            };
            //var updatedEntity = _context.Receipies.Update(receipyEntity);

            return Task.FromResult(receipyEntity);
        }
    }
}

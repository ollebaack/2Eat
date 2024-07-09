using _2Eat.Domain;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace _2Eat.Infrastructure
{
    public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : DbContext(options)
    {
        public DbSet<Recipe> Recipes { get; set; }
        public DbSet<Ingredient> Ingredients { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Recipe>()
                .HasMany(r => r.Ingredients)
                .WithMany(i => i.Recipes);

            // Ensure the Name property of Ingredient is unique
            modelBuilder.Entity<Ingredient>()
                .HasIndex(i => i.Name)
                .IsUnique();

            // Ensure the Name property of Ingredient is unique
            modelBuilder.Entity<Recipe>()
                .HasIndex(i => i.Name)
                .IsUnique();

            SeedData(modelBuilder); // Call the seed method
        }

        public static void SeedData(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Ingredient>().HasData(
                new Ingredient { Id = 1, Name = "Vetemjöl" }, // Wheat flour
                new Ingredient { Id = 2, Name = "Strösocker" }, // Granulated sugar
                new Ingredient { Id = 3, Name = "Ägg" }, // Eggs
                new Ingredient { Id = 4, Name = "Smör" }, // Butter
                new Ingredient { Id = 5, Name = "Mjölk" }, // Milk
                new Ingredient { Id = 6, Name = "Grädde" }, // Cream
                new Ingredient { Id = 7, Name = "Potatis" }, // Potatoes
                new Ingredient { Id = 8, Name = "Lax" }, // Salmon
                new Ingredient { Id = 9, Name = "Dill" }, // Dill
                new Ingredient { Id = 11, Name = "Rödbetor" }, // Beetroot
                new Ingredient { Id = 12, Name = "Räkor" }, // Shrimps
                new Ingredient { Id = 13, Name = "Kavring" }, // Dark rye bread
                new Ingredient { Id = 14, Name = "Västerbottensost" }, // Västerbotten cheese
                new Ingredient { Id = 15, Name = "Renkött" }, // Reindeer meat
                new Ingredient { Id = 16, Name = "Lingon" }, // Lingonberries
                new Ingredient { Id = 17, Name = "Kanel" }, // Cinnamon
                new Ingredient { Id = 18, Name = "Kardemumma" }, // Cardamom
                new Ingredient { Id = 19, Name = "Älgkött" }, // Moose meat
                new Ingredient { Id = 20, Name = "Surströmming" } // Surströmming
            );
        }
    }
}

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
        public DbSet<Recipe> Recipes { get; set; } = default!;
        public DbSet<Ingredient> Ingredients { get; set; } = default!;
        public DbSet<RecipeIngredient> RecipeIngredients { get; set; } = default!;
        public DbSet<Allergens> Allersgens { get; set; } = default!;
        public DbSet<Category> Categories { get; set; } = default!;
        public DbSet<MealPlan> MealPlans { get; set; } = default!;
        //public DbSet<MealPlanDay> MealPlanDays { get; set; } = default!;
        public DbSet<ShoppingList> ShoppingLists { get; set; } = default!;
        public DbSet<ShoppingListItem> ShoppingListItems { get; set; } = default!;
        public DbSet<User> Users { get; set; } = default!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Recipe>()
                .HasOne(x => x.Category)
                .WithMany(x => x.Recipes);

            modelBuilder.Entity<Ingredient>()
                .HasOne(x => x.Category)
                .WithMany(x => x.Ingredients);

            modelBuilder.Entity<Ingredient>()
                .HasMany(x => x.Allergens)
                .WithMany();

            modelBuilder.Entity<RecipeIngredient>()
                .HasKey(ir => new { ir.RecipeId, ir.IngredientId });

            // Ensure the Name property of Ingredient is unique
            modelBuilder.Entity<Ingredient>()
                .HasIndex(i => i.Name)
                .IsUnique();

            // Ensure the Name property of Ingredient is unique
            modelBuilder.Entity<Recipe>()
                .HasIndex(i => i.Name)
                .IsUnique();

            modelBuilder.Entity<ShoppingList>()
                .HasMany(x => x.Items)
                .WithOne(x => x.ShoppingList);

            modelBuilder.Entity<User>()
                .HasOne(x => x.ShoppingList)
                .WithOne(x => x.User)
                .HasForeignKey<User>(x => x.ShoppingListId);

            modelBuilder.Entity<User>()
                .HasMany(x => x.MealPlans)
                .WithOne(x => x.User);


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

            // Seed Recipes
            modelBuilder.Entity<Recipe>().HasData(
                new Recipe { Id = 1, Name = "Kanelbullar", Instructions = "Mix ingredients and bake at 180°C for 15 minutes." },
                new Recipe { Id = 2, Name = "Räkmacka", Instructions = "Assemble the sandwich with bread, shrimps, mayonnaise, and dill." },
                new Recipe { Id = 3, Name = "Älgstek", Instructions = "Roast the moose meat with juniper berries and serve with potatoes and lingonberries." },
                new Recipe { Id = 4, Name = "Lax med grädde", Instructions = "" }
            );

            // Additional Seed for IngredientRecipe join table to establish more relationships
            modelBuilder.Entity<RecipeIngredient>().HasData(
                // Existing relationships

                // Additional relationships for Kanelbullar
                new { Id = 1, Order = 0, IngredientId = 1, RecipeId = 1 }, // Vetemjöl for Kanelbullar
                new { Id = 2, Order = 1, IngredientId = 17, RecipeId = 1 }, // Kanel for Kanelbullar
                new { Id = 3, Order = 2, IngredientId = 2, RecipeId = 1 }, // Strösocker for Kanelbullar
                new { Id = 4, Order = 3, IngredientId = 3, RecipeId = 1 }, // Ägg for Kanelbullar
                new { Id = 5, Order = 4, IngredientId = 4, RecipeId = 1 }, // Smör for Kanelbullar
                new { Id = 6, Order = 5, IngredientId = 5, RecipeId = 1 }, // Mjölk for Kanelbullar

                // Additional relationships for Räkmacka
                new { Id = 7, Order = 0, IngredientId = 12, RecipeId = 2 }, // Räkor for Räkmacka
                new { Id = 8, Order = 1, IngredientId = 13, RecipeId = 2 }, // Kavring for Räkmacka
                new { Id = 9, Order = 2, IngredientId = 9, RecipeId = 2 },  // Dill for Räkmacka

                // Additional relationships for Älgstek
                new { Id = 10, Order = 0, IngredientId = 19, RecipeId = 3 }, // Älgkött for Älgstek
                new { Id = 11, Order = 1, IngredientId = 7, RecipeId = 3 },  // Potatis for Älgstek
                new { Id = 12, Order = 2, IngredientId = 16, RecipeId = 3 }, // Lingon for Älgstek

                // New Recipe: Lax med grädde (Salmon with cream)
                new { Id = 13, Order = 0, IngredientId = 8, RecipeId = 4 },  // Lax for Lax med grädde
                new { Id = 14, Order = 1, IngredientId = 6, RecipeId = 4 },  // Grädde for Lax med grädde
                new { Id = 15, Order = 2, IngredientId = 7, RecipeId = 4 },  // Potatis for Lax med grädde
                new { Id = 16, Order = 3, IngredientId = 5, RecipeId = 4 }   // Mjölk for Lax med grädde
            );

        }
    }
}

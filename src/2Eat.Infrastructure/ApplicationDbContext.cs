using _2Eat.Domain;
using _2Eat.Domain.Enums;
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
        public DbSet<IngredientMeasurement> IngredientMeasurements { get; set; } = default!;
        public DbSet<Allergen> Allergens { get; set; } = default!;
        public DbSet<Category> Categories { get; set; } = default!;
        public DbSet<MealPlan> MealPlans { get; set; } = default!;
        //public DbSet<MealPlanDay> MealPlanDays { get; set; } = default!;
        public DbSet<ShoppingList> ShoppingLists { get; set; } = default!;
        public DbSet<ShoppingListItem> ShoppingListItems { get; set; } = default!;
        public DbSet<User> Users { get; set; } = default!;
        public DbSet<Domain.Files.FileUpload> Files { get; set; } = default!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Recipe>()
                .HasOne(x => x.Category)
                .WithMany(x => x.Recipes);

            modelBuilder.Entity<Ingredient>()
                .HasOne(x => x.Category)
                .WithMany(x => x.Ingredients);

            modelBuilder.Entity<RecipeIngredient>()
                .HasKey(ir => new { ir.RecipeId, ir.IngredientId });

            modelBuilder.Entity<RecipeIngredient>()
                .HasOne(x => x.IngredientMeasurement)
                .WithOne();

            modelBuilder.Entity<Ingredient>()
                .HasMany(x => x.Allergens)
                .WithMany(x => x.Ingredients);

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

            modelBuilder.Entity<Allergen>().HasData(
                new Allergen { Id = AllergenEnum.Gluten },
                new Allergen { Id = AllergenEnum.Vegetariskt },
                new Allergen { Id = AllergenEnum.Veganskt },
                new Allergen { Id = AllergenEnum.Laktos },
                new Allergen { Id = AllergenEnum.Nötter }
            );

            modelBuilder.Entity("AllergenIngredient").HasData(
                new { AllergensId = AllergenEnum.Gluten, IngredientsId = 1 }
            );

            // Seed Recipes
            modelBuilder.Entity<Recipe>().HasData(
                new Recipe { Id = 1, Name = "Kanelbullar", CookTime = 60, Instructions = "Mix ingredients and bake at 180°C for 15 minutes." },
                new Recipe { Id = 2, Name = "Räkmacka", Instructions = "Assemble the sandwich with bread, shrimps, mayonnaise, and dill." },
                new Recipe { Id = 3, Name = "Älgstek", Instructions = "Roast the moose meat with juniper berries and serve with potatoes and lingonberries." },
                new Recipe { Id = 4, Name = "Lax med grädde", Instructions = "" }
            );

            modelBuilder.Entity<IngredientMeasurement>().HasData(
                new IngredientMeasurement { Id = 1, Quantity = 500, Unit = UnitOfMeasurement.g }, // För Vetemjöl
                new IngredientMeasurement { Id = 2, Quantity = 250, Unit = UnitOfMeasurement.g }, // För Kanel
                new IngredientMeasurement { Id = 3, Quantity = 200, Unit = UnitOfMeasurement.g }, // För Strösocker
                new IngredientMeasurement { Id = 4, Quantity = 3, Unit = UnitOfMeasurement.st },   // För Ägg
                new IngredientMeasurement { Id = 5, Quantity = 100, Unit = UnitOfMeasurement.g },  // För Smör
                new IngredientMeasurement { Id = 6, Quantity = 250, Unit = UnitOfMeasurement.ml }, // För Mjölk
                new IngredientMeasurement { Id = 7, Quantity = 200, Unit = UnitOfMeasurement.g },  // För Räkor
                new IngredientMeasurement { Id = 8, Quantity = 2, Unit = UnitOfMeasurement.st },   // För Kavring
                new IngredientMeasurement { Id = 9, Quantity = 50, Unit = UnitOfMeasurement.g },   // För Dill
                new IngredientMeasurement { Id = 10, Quantity = 1, Unit = UnitOfMeasurement.kg },  // För Älgkött
                new IngredientMeasurement { Id = 11, Quantity = 500, Unit = UnitOfMeasurement.g }, // För Potatis
                new IngredientMeasurement { Id = 12, Quantity = 100, Unit = UnitOfMeasurement.g }, // För Lingon
                new IngredientMeasurement { Id = 13, Quantity = 400, Unit = UnitOfMeasurement.g }, // För Lax
                new IngredientMeasurement { Id = 14, Quantity = 200, Unit = UnitOfMeasurement.ml }  // För Grädde
            );

            // Seed RecipeIngredients with IngredientMeasurementId
            modelBuilder.Entity<RecipeIngredient>().HasData(
                new RecipeIngredient { Id = 1, Order = 0, IngredientId = 1, RecipeId = 1, IngredientMeasurementId = 1 },
                new RecipeIngredient { Id = 2, Order = 1, IngredientId = 17, RecipeId = 1, IngredientMeasurementId = 2 },
                new RecipeIngredient { Id = 3, Order = 2, IngredientId = 2, RecipeId = 1, IngredientMeasurementId = 3 },
                new RecipeIngredient { Id = 4, Order = 3, IngredientId = 3, RecipeId = 1, IngredientMeasurementId = 4 },
                new RecipeIngredient { Id = 5, Order = 4, IngredientId = 4, RecipeId = 1, IngredientMeasurementId = 5 },
                new RecipeIngredient { Id = 6, Order = 5, IngredientId = 5, RecipeId = 1, IngredientMeasurementId = 6 },
                new RecipeIngredient { Id = 7, Order = 0, IngredientId = 12, RecipeId = 2, IngredientMeasurementId = 7 },
                new RecipeIngredient { Id = 8, Order = 1, IngredientId = 13, RecipeId = 2, IngredientMeasurementId = 8 },
                new RecipeIngredient { Id = 9, Order = 2, IngredientId = 9, RecipeId = 2, IngredientMeasurementId = 9 },
                new RecipeIngredient { Id = 10, Order = 0, IngredientId = 19, RecipeId = 3, IngredientMeasurementId = 10 },
                new RecipeIngredient { Id = 11, Order = 1, IngredientId = 7, RecipeId = 3, IngredientMeasurementId = 11 },
                new RecipeIngredient { Id = 12, Order = 2, IngredientId = 16, RecipeId = 3, IngredientMeasurementId = 12 },
                new RecipeIngredient { Id = 13, Order = 0, IngredientId = 8, RecipeId = 4, IngredientMeasurementId = 13 },
                new RecipeIngredient { Id = 14, Order = 1, IngredientId = 6, RecipeId = 4, IngredientMeasurementId = 14 }
            );

        }
    }
}

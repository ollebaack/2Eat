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
        public DbSet<MealPlanDay> MealPlanDays { get; set; } = default!;
        public DbSet<PantryItem> PantryItems { get; set; } = default!;
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
                .HasForeignKey<User>(x => x.ShoppingListId)
                .IsRequired(false);

            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();

            modelBuilder.Entity<MealPlan>()
                .HasMany(x => x.Days)
                .WithOne(x => x.MealPlan)
                .HasForeignKey(x => x.MealPlanId);

            SeedData(modelBuilder);
        }

        public static void SeedData(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Category>().HasData(
                new Category { Id = 1, Name = "Bakverk" },
                new Category { Id = 2, Name = "Smörgåsar" },
                new Category { Id = 3, Name = "Kött" },
                new Category { Id = 4, Name = "Fisk" },
                new Category { Id = 5, Name = "Övrigt" }
            );

            modelBuilder.Entity<Ingredient>().HasData(
                new Ingredient { Id = 1, Name = "Vetemjöl", CategoryId = 1 },
                new Ingredient { Id = 2, Name = "Strösocker", CategoryId = 5 },
                new Ingredient { Id = 3, Name = "Ägg", CategoryId = 5 },
                new Ingredient { Id = 4, Name = "Smör", CategoryId = 5 },
                new Ingredient { Id = 5, Name = "Mjölk", CategoryId = 5 },
                new Ingredient { Id = 6, Name = "Grädde", CategoryId = 5 },
                new Ingredient { Id = 7, Name = "Potatis", CategoryId = 5 },
                new Ingredient { Id = 8, Name = "Lax", CategoryId = 4 },
                new Ingredient { Id = 9, Name = "Dill", CategoryId = 5 },
                new Ingredient { Id = 11, Name = "Rödbetor", CategoryId = 5 },
                new Ingredient { Id = 12, Name = "Räkor", CategoryId = 4 },
                new Ingredient { Id = 13, Name = "Kavring", CategoryId = 5 },
                new Ingredient { Id = 14, Name = "Västerbottensost", CategoryId = 5 },
                new Ingredient { Id = 15, Name = "Renkött", CategoryId = 3 },
                new Ingredient { Id = 16, Name = "Lingon", CategoryId = 5 },
                new Ingredient { Id = 17, Name = "Kanel", CategoryId = 1 },
                new Ingredient { Id = 18, Name = "Kardemumma", CategoryId = 1 },
                new Ingredient { Id = 19, Name = "Älgkött", CategoryId = 3 },
                new Ingredient { Id = 20, Name = "Surströmming", CategoryId = 4 }
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
                new Recipe { Id = 1, Name = "Kanelbullar", Description = "Traditionella svenska kanelbullar", CategoryId = 1, Instructions = "Blanda ingredienser och baka i 180°C i 15 minuter.", Servings = 4, Rating = 5, CookTime = 15, PrepTime = 45, LastModified = new DateTimeOffset(2021, 10, 10, 10, 30, 0, TimeSpan.Zero) },
                new Recipe { Id = 2, Name = "Räkmacka", Description = "En klassisk svensk räkmacka", CategoryId = 2, Instructions = "Montera mackan med bröd, räkor, majonnäs och dill.", Servings = 2, Rating = 4, CookTime = 0, PrepTime = 10, LastModified = new DateTimeOffset(2021, 10, 10, 12, 0, 0, TimeSpan.Zero) },
                new Recipe { Id = 3, Name = "Älgstek", Description = "Älgstek med enbär", CategoryId = 3, Instructions = "Rosta älgköttet med enbär och servera med potatis och lingon.", Servings = 6, Rating = 5, CookTime = 120, PrepTime = 30, LastModified = new DateTimeOffset(2023, 10, 10, 15, 45, 0, TimeSpan.Zero) },
                new Recipe { Id = 4, Name = "Lax med grädde", Description = "Lax i en krämig sås", CategoryId = 4, Instructions = "Laga laxen i en gräddig sås med dill och servera med kokt potatis.", Servings = 4, Rating = 4, CookTime = 30, PrepTime = 20, LastModified = new DateTimeOffset(2024, 10, 10, 9, 15, 0, TimeSpan.Zero) }
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

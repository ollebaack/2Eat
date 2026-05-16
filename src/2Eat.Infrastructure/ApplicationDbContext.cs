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
        public DbSet<Samling> Samlingar { get; set; } = default!;
        public DbSet<SamlingRecept> SamlingarRecept { get; set; } = default!;

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

            modelBuilder.Entity<Recipe>()
                .HasMany(x => x.Allergens)
                .WithMany(x => x.Recipes);

            // Ensure the Name property of Ingredient is unique
            modelBuilder.Entity<Ingredient>()
                .HasIndex(i => i.Name)
                .IsUnique();

            modelBuilder.Entity<Recipe>()
                .HasOne<User>()
                .WithMany()
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Recipe>()
                .HasIndex(x => x.UserId);

            // Name must be unique per user, not globally
            modelBuilder.Entity<Recipe>()
                .HasIndex(i => new { i.UserId, i.Name })
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

            modelBuilder.Entity<MealPlan>()
                .HasOne<User>()
                .WithMany()
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<MealPlan>()
                .HasIndex(x => x.UserId);

            modelBuilder.Entity<MealPlanDay>()
                .HasIndex(x => x.MealPlanId);

            modelBuilder.Entity<MealPlanDay>()
                .HasIndex(x => x.RecipeId);

            modelBuilder.Entity<PantryItem>()
                .HasOne<User>()
                .WithMany()
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<PantryItem>()
                .HasIndex(x => x.UserId);

            modelBuilder.Entity<ShoppingList>()
                .HasIndex(x => x.UserId);

            modelBuilder.Entity<ShoppingListItem>()
                .HasIndex(x => x.ShoppingListId);

            modelBuilder.Entity<SamlingRecept>()
                .HasKey(sr => new { sr.SamlingId, sr.ReceptId });

            modelBuilder.Entity<Samling>()
                .HasOne<User>()
                .WithMany()
                .HasForeignKey(s => s.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Samling>()
                .HasMany(s => s.Recept)
                .WithOne(sr => sr.Samling)
                .HasForeignKey(sr => sr.SamlingId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<SamlingRecept>()
                .HasOne(sr => sr.Recipe)
                .WithMany()
                .HasForeignKey(sr => sr.ReceptId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Samling>()
                .HasIndex(s => s.UserId);

            modelBuilder.Entity<SamlingRecept>()
                .HasIndex(sr => sr.SamlingId);

            modelBuilder.Entity<SamlingRecept>()
                .HasIndex(sr => sr.ReceptId);

            SeedData(modelBuilder);
        }

        public static void SeedData(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Category>().HasData(
                new Category { Id = 1, Name = "Bakverk",   IsDinnerEligible = false },
                new Category { Id = 2, Name = "Smörgåsar", IsDinnerEligible = true },
                new Category { Id = 3, Name = "Kött",      IsDinnerEligible = true },
                new Category { Id = 4, Name = "Fisk",      IsDinnerEligible = true },
                new Category { Id = 5, Name = "Övrigt",    IsDinnerEligible = true }
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
        }
    }
}

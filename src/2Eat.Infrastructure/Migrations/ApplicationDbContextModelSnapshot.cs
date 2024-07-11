﻿// <auto-generated />
using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using _2Eat.Infrastructure;

#nullable disable

namespace _2Eat.Infrastructure.Migrations
{
    [DbContext(typeof(ApplicationDbContext))]
    partial class ApplicationDbContextModelSnapshot : ModelSnapshot
    {
        protected override void BuildModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder.HasAnnotation("ProductVersion", "8.0.7");

            modelBuilder.Entity("AllergenIngredient", b =>
                {
                    b.Property<int>("AllergensId")
                        .HasColumnType("INTEGER");

                    b.Property<int>("IngredientsId")
                        .HasColumnType("INTEGER");

                    b.HasKey("AllergensId", "IngredientsId");

                    b.HasIndex("IngredientsId");

                    b.ToTable("AllergenIngredient");

                    b.HasData(
                        new
                        {
                            AllergensId = 0,
                            IngredientsId = 1
                        });
                });

            modelBuilder.Entity("_2Eat.Domain.Allergen", b =>
                {
                    b.Property<int>("Id")
                        .HasColumnType("INTEGER");

                    b.HasKey("Id");

                    b.ToTable("Allergens");

                    b.HasData(
                        new
                        {
                            Id = 0
                        },
                        new
                        {
                            Id = 1
                        },
                        new
                        {
                            Id = 2
                        },
                        new
                        {
                            Id = 3
                        },
                        new
                        {
                            Id = 4
                        });
                });

            modelBuilder.Entity("_2Eat.Domain.Category", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("INTEGER");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasMaxLength(64)
                        .HasColumnType("TEXT");

                    b.HasKey("Id");

                    b.ToTable("Categories");
                });

            modelBuilder.Entity("_2Eat.Domain.Ingredient", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("INTEGER");

                    b.Property<int>("CategoryId")
                        .HasColumnType("INTEGER");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasMaxLength(64)
                        .HasColumnType("TEXT");

                    b.HasKey("Id");

                    b.HasIndex("CategoryId");

                    b.HasIndex("Name")
                        .IsUnique();

                    b.ToTable("Ingredients");

                    b.HasData(
                        new
                        {
                            Id = 1,
                            CategoryId = 0,
                            Name = "Vetemjöl"
                        },
                        new
                        {
                            Id = 2,
                            CategoryId = 0,
                            Name = "Strösocker"
                        },
                        new
                        {
                            Id = 3,
                            CategoryId = 0,
                            Name = "Ägg"
                        },
                        new
                        {
                            Id = 4,
                            CategoryId = 0,
                            Name = "Smör"
                        },
                        new
                        {
                            Id = 5,
                            CategoryId = 0,
                            Name = "Mjölk"
                        },
                        new
                        {
                            Id = 6,
                            CategoryId = 0,
                            Name = "Grädde"
                        },
                        new
                        {
                            Id = 7,
                            CategoryId = 0,
                            Name = "Potatis"
                        },
                        new
                        {
                            Id = 8,
                            CategoryId = 0,
                            Name = "Lax"
                        },
                        new
                        {
                            Id = 9,
                            CategoryId = 0,
                            Name = "Dill"
                        },
                        new
                        {
                            Id = 11,
                            CategoryId = 0,
                            Name = "Rödbetor"
                        },
                        new
                        {
                            Id = 12,
                            CategoryId = 0,
                            Name = "Räkor"
                        },
                        new
                        {
                            Id = 13,
                            CategoryId = 0,
                            Name = "Kavring"
                        },
                        new
                        {
                            Id = 14,
                            CategoryId = 0,
                            Name = "Västerbottensost"
                        },
                        new
                        {
                            Id = 15,
                            CategoryId = 0,
                            Name = "Renkött"
                        },
                        new
                        {
                            Id = 16,
                            CategoryId = 0,
                            Name = "Lingon"
                        },
                        new
                        {
                            Id = 17,
                            CategoryId = 0,
                            Name = "Kanel"
                        },
                        new
                        {
                            Id = 18,
                            CategoryId = 0,
                            Name = "Kardemumma"
                        },
                        new
                        {
                            Id = 19,
                            CategoryId = 0,
                            Name = "Älgkött"
                        },
                        new
                        {
                            Id = 20,
                            CategoryId = 0,
                            Name = "Surströmming"
                        });
                });

            modelBuilder.Entity("_2Eat.Domain.IngredientMeasurement", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("INTEGER");

                    b.Property<double>("Quantity")
                        .HasColumnType("REAL");

                    b.Property<int>("Unit")
                        .HasColumnType("INTEGER");

                    b.HasKey("Id");

                    b.ToTable("IngredientMeasurements");

                    b.HasData(
                        new
                        {
                            Id = 1,
                            Quantity = 500.0,
                            Unit = 0
                        },
                        new
                        {
                            Id = 2,
                            Quantity = 250.0,
                            Unit = 0
                        },
                        new
                        {
                            Id = 3,
                            Quantity = 200.0,
                            Unit = 0
                        },
                        new
                        {
                            Id = 4,
                            Quantity = 3.0,
                            Unit = 9
                        },
                        new
                        {
                            Id = 5,
                            Quantity = 100.0,
                            Unit = 0
                        },
                        new
                        {
                            Id = 6,
                            Quantity = 250.0,
                            Unit = 1
                        },
                        new
                        {
                            Id = 7,
                            Quantity = 200.0,
                            Unit = 0
                        },
                        new
                        {
                            Id = 8,
                            Quantity = 2.0,
                            Unit = 9
                        },
                        new
                        {
                            Id = 9,
                            Quantity = 50.0,
                            Unit = 0
                        },
                        new
                        {
                            Id = 10,
                            Quantity = 1.0,
                            Unit = 2
                        },
                        new
                        {
                            Id = 11,
                            Quantity = 500.0,
                            Unit = 0
                        },
                        new
                        {
                            Id = 12,
                            Quantity = 100.0,
                            Unit = 0
                        },
                        new
                        {
                            Id = 13,
                            Quantity = 400.0,
                            Unit = 0
                        },
                        new
                        {
                            Id = 14,
                            Quantity = 200.0,
                            Unit = 1
                        });
                });

            modelBuilder.Entity("_2Eat.Domain.MealPlan", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("INTEGER");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("TEXT");

                    b.Property<int>("UserId")
                        .HasColumnType("INTEGER");

                    b.HasKey("Id");

                    b.HasIndex("UserId");

                    b.ToTable("MealPlans");
                });

            modelBuilder.Entity("_2Eat.Domain.Recipe", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("INTEGER");

                    b.Property<int>("CategoryId")
                        .HasColumnType("INTEGER");

                    b.Property<int>("CookTime")
                        .HasColumnType("INTEGER");

                    b.Property<DateTimeOffset>("CreatedAt")
                        .HasColumnType("TEXT");

                    b.Property<string>("Description")
                        .IsRequired()
                        .HasColumnType("TEXT");

                    b.Property<string>("ImageUrl")
                        .HasColumnType("TEXT");

                    b.Property<string>("Instructions")
                        .IsRequired()
                        .HasColumnType("TEXT");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasMaxLength(64)
                        .HasColumnType("TEXT");

                    b.Property<int>("PrepTime")
                        .HasColumnType("INTEGER");

                    b.Property<int>("Rating")
                        .HasColumnType("INTEGER");

                    b.Property<int>("Servings")
                        .HasColumnType("INTEGER");

                    b.HasKey("Id");

                    b.HasIndex("CategoryId");

                    b.HasIndex("Name")
                        .IsUnique();

                    b.ToTable("Recipes");

                    b.HasData(
                        new
                        {
                            Id = 1,
                            CategoryId = 0,
                            CookTime = 60,
                            CreatedAt = new DateTimeOffset(new DateTime(2024, 7, 11, 15, 6, 18, 265, DateTimeKind.Unspecified).AddTicks(5747), new TimeSpan(0, 2, 0, 0, 0)),
                            Description = "",
                            Instructions = "Mix ingredients and bake at 180°C for 15 minutes.",
                            Name = "Kanelbullar",
                            PrepTime = 0,
                            Rating = 0,
                            Servings = 0
                        },
                        new
                        {
                            Id = 2,
                            CategoryId = 0,
                            CookTime = 0,
                            CreatedAt = new DateTimeOffset(new DateTime(2024, 7, 11, 15, 6, 18, 265, DateTimeKind.Unspecified).AddTicks(5804), new TimeSpan(0, 2, 0, 0, 0)),
                            Description = "",
                            Instructions = "Assemble the sandwich with bread, shrimps, mayonnaise, and dill.",
                            Name = "Räkmacka",
                            PrepTime = 0,
                            Rating = 0,
                            Servings = 0
                        },
                        new
                        {
                            Id = 3,
                            CategoryId = 0,
                            CookTime = 0,
                            CreatedAt = new DateTimeOffset(new DateTime(2024, 7, 11, 15, 6, 18, 265, DateTimeKind.Unspecified).AddTicks(5806), new TimeSpan(0, 2, 0, 0, 0)),
                            Description = "",
                            Instructions = "Roast the moose meat with juniper berries and serve with potatoes and lingonberries.",
                            Name = "Älgstek",
                            PrepTime = 0,
                            Rating = 0,
                            Servings = 0
                        },
                        new
                        {
                            Id = 4,
                            CategoryId = 0,
                            CookTime = 0,
                            CreatedAt = new DateTimeOffset(new DateTime(2024, 7, 11, 15, 6, 18, 265, DateTimeKind.Unspecified).AddTicks(5808), new TimeSpan(0, 2, 0, 0, 0)),
                            Description = "",
                            Instructions = "",
                            Name = "Lax med grädde",
                            PrepTime = 0,
                            Rating = 0,
                            Servings = 0
                        });
                });

            modelBuilder.Entity("_2Eat.Domain.RecipeIngredient", b =>
                {
                    b.Property<int>("RecipeId")
                        .HasColumnType("INTEGER");

                    b.Property<int>("IngredientId")
                        .HasColumnType("INTEGER");

                    b.Property<int>("Id")
                        .HasColumnType("INTEGER");

                    b.Property<int>("IngredientMeasurementId")
                        .HasColumnType("INTEGER");

                    b.Property<int>("Order")
                        .HasColumnType("INTEGER");

                    b.HasKey("RecipeId", "IngredientId");

                    b.HasIndex("IngredientId");

                    b.HasIndex("IngredientMeasurementId")
                        .IsUnique();

                    b.ToTable("RecipeIngredients");

                    b.HasData(
                        new
                        {
                            RecipeId = 1,
                            IngredientId = 1,
                            Id = 1,
                            IngredientMeasurementId = 1,
                            Order = 0
                        },
                        new
                        {
                            RecipeId = 1,
                            IngredientId = 17,
                            Id = 2,
                            IngredientMeasurementId = 2,
                            Order = 1
                        },
                        new
                        {
                            RecipeId = 1,
                            IngredientId = 2,
                            Id = 3,
                            IngredientMeasurementId = 3,
                            Order = 2
                        },
                        new
                        {
                            RecipeId = 1,
                            IngredientId = 3,
                            Id = 4,
                            IngredientMeasurementId = 4,
                            Order = 3
                        },
                        new
                        {
                            RecipeId = 1,
                            IngredientId = 4,
                            Id = 5,
                            IngredientMeasurementId = 5,
                            Order = 4
                        },
                        new
                        {
                            RecipeId = 1,
                            IngredientId = 5,
                            Id = 6,
                            IngredientMeasurementId = 6,
                            Order = 5
                        },
                        new
                        {
                            RecipeId = 2,
                            IngredientId = 12,
                            Id = 7,
                            IngredientMeasurementId = 7,
                            Order = 0
                        },
                        new
                        {
                            RecipeId = 2,
                            IngredientId = 13,
                            Id = 8,
                            IngredientMeasurementId = 8,
                            Order = 1
                        },
                        new
                        {
                            RecipeId = 2,
                            IngredientId = 9,
                            Id = 9,
                            IngredientMeasurementId = 9,
                            Order = 2
                        },
                        new
                        {
                            RecipeId = 3,
                            IngredientId = 19,
                            Id = 10,
                            IngredientMeasurementId = 10,
                            Order = 0
                        },
                        new
                        {
                            RecipeId = 3,
                            IngredientId = 7,
                            Id = 11,
                            IngredientMeasurementId = 11,
                            Order = 1
                        },
                        new
                        {
                            RecipeId = 3,
                            IngredientId = 16,
                            Id = 12,
                            IngredientMeasurementId = 12,
                            Order = 2
                        },
                        new
                        {
                            RecipeId = 4,
                            IngredientId = 8,
                            Id = 13,
                            IngredientMeasurementId = 13,
                            Order = 0
                        },
                        new
                        {
                            RecipeId = 4,
                            IngredientId = 6,
                            Id = 14,
                            IngredientMeasurementId = 14,
                            Order = 1
                        });
                });

            modelBuilder.Entity("_2Eat.Domain.ShoppingList", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("INTEGER");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("TEXT");

                    b.Property<int>("UserId")
                        .HasColumnType("INTEGER");

                    b.HasKey("Id");

                    b.ToTable("ShoppingLists");
                });

            modelBuilder.Entity("_2Eat.Domain.ShoppingListItem", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("INTEGER");

                    b.Property<bool>("IsChecked")
                        .HasColumnType("INTEGER");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("TEXT");

                    b.Property<int>("ShoppingListId")
                        .HasColumnType("INTEGER");

                    b.HasKey("Id");

                    b.HasIndex("ShoppingListId");

                    b.ToTable("ShoppingListItems");
                });

            modelBuilder.Entity("_2Eat.Domain.User", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("INTEGER");

                    b.Property<string>("Email")
                        .IsRequired()
                        .HasColumnType("TEXT");

                    b.Property<int>("ShoppingListId")
                        .HasColumnType("INTEGER");

                    b.HasKey("Id");

                    b.HasIndex("ShoppingListId")
                        .IsUnique();

                    b.ToTable("Users");
                });

            modelBuilder.Entity("AllergenIngredient", b =>
                {
                    b.HasOne("_2Eat.Domain.Allergen", null)
                        .WithMany()
                        .HasForeignKey("AllergensId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("_2Eat.Domain.Ingredient", null)
                        .WithMany()
                        .HasForeignKey("IngredientsId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();
                });

            modelBuilder.Entity("_2Eat.Domain.Ingredient", b =>
                {
                    b.HasOne("_2Eat.Domain.Category", "Category")
                        .WithMany("Ingredients")
                        .HasForeignKey("CategoryId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Category");
                });

            modelBuilder.Entity("_2Eat.Domain.MealPlan", b =>
                {
                    b.HasOne("_2Eat.Domain.User", "User")
                        .WithMany("MealPlans")
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("User");
                });

            modelBuilder.Entity("_2Eat.Domain.Recipe", b =>
                {
                    b.HasOne("_2Eat.Domain.Category", "Category")
                        .WithMany("Recipes")
                        .HasForeignKey("CategoryId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Category");
                });

            modelBuilder.Entity("_2Eat.Domain.RecipeIngredient", b =>
                {
                    b.HasOne("_2Eat.Domain.Ingredient", "Ingredient")
                        .WithMany("Recipes")
                        .HasForeignKey("IngredientId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("_2Eat.Domain.IngredientMeasurement", "IngredientMeasurement")
                        .WithOne()
                        .HasForeignKey("_2Eat.Domain.RecipeIngredient", "IngredientMeasurementId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("_2Eat.Domain.Recipe", "Recipe")
                        .WithMany("Ingredients")
                        .HasForeignKey("RecipeId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Ingredient");

                    b.Navigation("IngredientMeasurement");

                    b.Navigation("Recipe");
                });

            modelBuilder.Entity("_2Eat.Domain.ShoppingListItem", b =>
                {
                    b.HasOne("_2Eat.Domain.ShoppingList", "ShoppingList")
                        .WithMany("Items")
                        .HasForeignKey("ShoppingListId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("ShoppingList");
                });

            modelBuilder.Entity("_2Eat.Domain.User", b =>
                {
                    b.HasOne("_2Eat.Domain.ShoppingList", "ShoppingList")
                        .WithOne("User")
                        .HasForeignKey("_2Eat.Domain.User", "ShoppingListId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("ShoppingList");
                });

            modelBuilder.Entity("_2Eat.Domain.Category", b =>
                {
                    b.Navigation("Ingredients");

                    b.Navigation("Recipes");
                });

            modelBuilder.Entity("_2Eat.Domain.Ingredient", b =>
                {
                    b.Navigation("Recipes");
                });

            modelBuilder.Entity("_2Eat.Domain.Recipe", b =>
                {
                    b.Navigation("Ingredients");
                });

            modelBuilder.Entity("_2Eat.Domain.ShoppingList", b =>
                {
                    b.Navigation("Items");

                    b.Navigation("User")
                        .IsRequired();
                });

            modelBuilder.Entity("_2Eat.Domain.User", b =>
                {
                    b.Navigation("MealPlans");
                });
#pragma warning restore 612, 618
        }
    }
}

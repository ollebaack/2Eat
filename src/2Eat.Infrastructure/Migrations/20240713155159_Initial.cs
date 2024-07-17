using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace _2Eat.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class Initial : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Allergens",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Allergens", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Categories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Name = table.Column<string>(type: "TEXT", maxLength: 64, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Categories", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Files",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    FileName = table.Column<string>(type: "TEXT", nullable: true),
                    StoredFileName = table.Column<string>(type: "TEXT", nullable: true),
                    ContentType = table.Column<string>(type: "TEXT", nullable: true),
                    FileSize = table.Column<long>(type: "INTEGER", nullable: false),
                    IsSuccess = table.Column<bool>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Files", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "IngredientMeasurements",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Quantity = table.Column<double>(type: "REAL", nullable: false),
                    Unit = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_IngredientMeasurements", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ShoppingLists",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Name = table.Column<string>(type: "TEXT", nullable: false),
                    UserId = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ShoppingLists", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Ingredients",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Name = table.Column<string>(type: "TEXT", maxLength: 64, nullable: false),
                    CategoryId = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Ingredients", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Ingredients_Categories_CategoryId",
                        column: x => x.CategoryId,
                        principalTable: "Categories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Recipes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Name = table.Column<string>(type: "TEXT", maxLength: 64, nullable: false),
                    Description = table.Column<string>(type: "TEXT", nullable: false),
                    Instructions = table.Column<string>(type: "TEXT", nullable: false),
                    Servings = table.Column<int>(type: "INTEGER", nullable: false),
                    Rating = table.Column<int>(type: "INTEGER", nullable: false),
                    CookTime = table.Column<int>(type: "INTEGER", nullable: false),
                    PrepTime = table.Column<int>(type: "INTEGER", nullable: false),
                    ImageUrl = table.Column<string>(type: "TEXT", nullable: true),
                    CreatedAt = table.Column<DateTimeOffset>(type: "TEXT", nullable: false),
                    CategoryId = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Recipes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Recipes_Categories_CategoryId",
                        column: x => x.CategoryId,
                        principalTable: "Categories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ShoppingListItems",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Name = table.Column<string>(type: "TEXT", nullable: false),
                    IsChecked = table.Column<bool>(type: "INTEGER", nullable: false),
                    ShoppingListId = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ShoppingListItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ShoppingListItems_ShoppingLists_ShoppingListId",
                        column: x => x.ShoppingListId,
                        principalTable: "ShoppingLists",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Email = table.Column<string>(type: "TEXT", nullable: false),
                    ShoppingListId = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Users_ShoppingLists_ShoppingListId",
                        column: x => x.ShoppingListId,
                        principalTable: "ShoppingLists",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AllergenIngredient",
                columns: table => new
                {
                    AllergensId = table.Column<int>(type: "INTEGER", nullable: false),
                    IngredientsId = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AllergenIngredient", x => new { x.AllergensId, x.IngredientsId });
                    table.ForeignKey(
                        name: "FK_AllergenIngredient_Allergens_AllergensId",
                        column: x => x.AllergensId,
                        principalTable: "Allergens",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AllergenIngredient_Ingredients_IngredientsId",
                        column: x => x.IngredientsId,
                        principalTable: "Ingredients",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "RecipeIngredients",
                columns: table => new
                {
                    RecipeId = table.Column<int>(type: "INTEGER", nullable: false),
                    IngredientId = table.Column<int>(type: "INTEGER", nullable: false),
                    Id = table.Column<int>(type: "INTEGER", nullable: false),
                    Order = table.Column<int>(type: "INTEGER", nullable: false),
                    IngredientMeasurementId = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RecipeIngredients", x => new { x.RecipeId, x.IngredientId });
                    table.ForeignKey(
                        name: "FK_RecipeIngredients_IngredientMeasurements_IngredientMeasurementId",
                        column: x => x.IngredientMeasurementId,
                        principalTable: "IngredientMeasurements",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_RecipeIngredients_Ingredients_IngredientId",
                        column: x => x.IngredientId,
                        principalTable: "Ingredients",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_RecipeIngredients_Recipes_RecipeId",
                        column: x => x.RecipeId,
                        principalTable: "Recipes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "MealPlans",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Name = table.Column<string>(type: "TEXT", nullable: false),
                    UserId = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MealPlans", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MealPlans_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "Allergens",
                column: "Id",
                values: new object[]
                {
                    0,
                    1,
                    2,
                    3,
                    4
                });

            migrationBuilder.InsertData(
                table: "IngredientMeasurements",
                columns: new[] { "Id", "Quantity", "Unit" },
                values: new object[,]
                {
                    { 1, 500.0, 0 },
                    { 2, 250.0, 0 },
                    { 3, 200.0, 0 },
                    { 4, 3.0, 9 },
                    { 5, 100.0, 0 },
                    { 6, 250.0, 1 },
                    { 7, 200.0, 0 },
                    { 8, 2.0, 9 },
                    { 9, 50.0, 0 },
                    { 10, 1.0, 2 },
                    { 11, 500.0, 0 },
                    { 12, 100.0, 0 },
                    { 13, 400.0, 0 },
                    { 14, 200.0, 1 }
                });

            migrationBuilder.InsertData(
                table: "Ingredients",
                columns: new[] { "Id", "CategoryId", "Name" },
                values: new object[,]
                {
                    { 1, 0, "Vetemjöl" },
                    { 2, 0, "Strösocker" },
                    { 3, 0, "Ägg" },
                    { 4, 0, "Smör" },
                    { 5, 0, "Mjölk" },
                    { 6, 0, "Grädde" },
                    { 7, 0, "Potatis" },
                    { 8, 0, "Lax" },
                    { 9, 0, "Dill" },
                    { 11, 0, "Rödbetor" },
                    { 12, 0, "Räkor" },
                    { 13, 0, "Kavring" },
                    { 14, 0, "Västerbottensost" },
                    { 15, 0, "Renkött" },
                    { 16, 0, "Lingon" },
                    { 17, 0, "Kanel" },
                    { 18, 0, "Kardemumma" },
                    { 19, 0, "Älgkött" },
                    { 20, 0, "Surströmming" }
                });

            migrationBuilder.InsertData(
                table: "Recipes",
                columns: new[] { "Id", "CategoryId", "CookTime", "CreatedAt", "Description", "ImageUrl", "Instructions", "Name", "PrepTime", "Rating", "Servings" },
                values: new object[,]
                {
                    { 1, 0, 60, new DateTimeOffset(new DateTime(2024, 7, 13, 17, 51, 59, 36, DateTimeKind.Unspecified).AddTicks(3447), new TimeSpan(0, 2, 0, 0, 0)), "", null, "Mix ingredients and bake at 180°C for 15 minutes.", "Kanelbullar", 0, 0, 0 },
                    { 2, 0, 0, new DateTimeOffset(new DateTime(2024, 7, 13, 17, 51, 59, 36, DateTimeKind.Unspecified).AddTicks(3518), new TimeSpan(0, 2, 0, 0, 0)), "", null, "Assemble the sandwich with bread, shrimps, mayonnaise, and dill.", "Räkmacka", 0, 0, 0 },
                    { 3, 0, 0, new DateTimeOffset(new DateTime(2024, 7, 13, 17, 51, 59, 36, DateTimeKind.Unspecified).AddTicks(3521), new TimeSpan(0, 2, 0, 0, 0)), "", null, "Roast the moose meat with juniper berries and serve with potatoes and lingonberries.", "Älgstek", 0, 0, 0 },
                    { 4, 0, 0, new DateTimeOffset(new DateTime(2024, 7, 13, 17, 51, 59, 36, DateTimeKind.Unspecified).AddTicks(3523), new TimeSpan(0, 2, 0, 0, 0)), "", null, "", "Lax med grädde", 0, 0, 0 }
                });

            migrationBuilder.InsertData(
                table: "AllergenIngredient",
                columns: new[] { "AllergensId", "IngredientsId" },
                values: new object[] { 0, 1 });

            migrationBuilder.InsertData(
                table: "RecipeIngredients",
                columns: new[] { "IngredientId", "RecipeId", "Id", "IngredientMeasurementId", "Order" },
                values: new object[,]
                {
                    { 1, 1, 1, 1, 0 },
                    { 2, 1, 3, 3, 2 },
                    { 3, 1, 4, 4, 3 },
                    { 4, 1, 5, 5, 4 },
                    { 5, 1, 6, 6, 5 },
                    { 17, 1, 2, 2, 1 },
                    { 9, 2, 9, 9, 2 },
                    { 12, 2, 7, 7, 0 },
                    { 13, 2, 8, 8, 1 },
                    { 7, 3, 11, 11, 1 },
                    { 16, 3, 12, 12, 2 },
                    { 19, 3, 10, 10, 0 },
                    { 6, 4, 14, 14, 1 },
                    { 8, 4, 13, 13, 0 }
                });

            migrationBuilder.CreateIndex(
                name: "IX_AllergenIngredient_IngredientsId",
                table: "AllergenIngredient",
                column: "IngredientsId");

            migrationBuilder.CreateIndex(
                name: "IX_Ingredients_CategoryId",
                table: "Ingredients",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_Ingredients_Name",
                table: "Ingredients",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_MealPlans_UserId",
                table: "MealPlans",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_RecipeIngredients_IngredientId",
                table: "RecipeIngredients",
                column: "IngredientId");

            migrationBuilder.CreateIndex(
                name: "IX_RecipeIngredients_IngredientMeasurementId",
                table: "RecipeIngredients",
                column: "IngredientMeasurementId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Recipes_CategoryId",
                table: "Recipes",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_Recipes_Name",
                table: "Recipes",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ShoppingListItems_ShoppingListId",
                table: "ShoppingListItems",
                column: "ShoppingListId");

            migrationBuilder.CreateIndex(
                name: "IX_Users_ShoppingListId",
                table: "Users",
                column: "ShoppingListId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AllergenIngredient");

            migrationBuilder.DropTable(
                name: "Files");

            migrationBuilder.DropTable(
                name: "MealPlans");

            migrationBuilder.DropTable(
                name: "RecipeIngredients");

            migrationBuilder.DropTable(
                name: "ShoppingListItems");

            migrationBuilder.DropTable(
                name: "Allergens");

            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.DropTable(
                name: "IngredientMeasurements");

            migrationBuilder.DropTable(
                name: "Ingredients");

            migrationBuilder.DropTable(
                name: "Recipes");

            migrationBuilder.DropTable(
                name: "ShoppingLists");

            migrationBuilder.DropTable(
                name: "Categories");
        }
    }
}

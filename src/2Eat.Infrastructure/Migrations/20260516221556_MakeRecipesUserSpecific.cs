using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace _2Eat.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class MakeRecipesUserSpecific : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Recipes_Name",
                table: "Recipes");

            migrationBuilder.DeleteData(
                table: "RecipeIngredients",
                keyColumns: new[] { "IngredientId", "RecipeId" },
                keyValues: new object[] { 1, 1 });

            migrationBuilder.DeleteData(
                table: "RecipeIngredients",
                keyColumns: new[] { "IngredientId", "RecipeId" },
                keyValues: new object[] { 2, 1 });

            migrationBuilder.DeleteData(
                table: "RecipeIngredients",
                keyColumns: new[] { "IngredientId", "RecipeId" },
                keyValues: new object[] { 3, 1 });

            migrationBuilder.DeleteData(
                table: "RecipeIngredients",
                keyColumns: new[] { "IngredientId", "RecipeId" },
                keyValues: new object[] { 4, 1 });

            migrationBuilder.DeleteData(
                table: "RecipeIngredients",
                keyColumns: new[] { "IngredientId", "RecipeId" },
                keyValues: new object[] { 5, 1 });

            migrationBuilder.DeleteData(
                table: "RecipeIngredients",
                keyColumns: new[] { "IngredientId", "RecipeId" },
                keyValues: new object[] { 17, 1 });

            migrationBuilder.DeleteData(
                table: "RecipeIngredients",
                keyColumns: new[] { "IngredientId", "RecipeId" },
                keyValues: new object[] { 9, 2 });

            migrationBuilder.DeleteData(
                table: "RecipeIngredients",
                keyColumns: new[] { "IngredientId", "RecipeId" },
                keyValues: new object[] { 12, 2 });

            migrationBuilder.DeleteData(
                table: "RecipeIngredients",
                keyColumns: new[] { "IngredientId", "RecipeId" },
                keyValues: new object[] { 13, 2 });

            migrationBuilder.DeleteData(
                table: "RecipeIngredients",
                keyColumns: new[] { "IngredientId", "RecipeId" },
                keyValues: new object[] { 7, 3 });

            migrationBuilder.DeleteData(
                table: "RecipeIngredients",
                keyColumns: new[] { "IngredientId", "RecipeId" },
                keyValues: new object[] { 16, 3 });

            migrationBuilder.DeleteData(
                table: "RecipeIngredients",
                keyColumns: new[] { "IngredientId", "RecipeId" },
                keyValues: new object[] { 19, 3 });

            migrationBuilder.DeleteData(
                table: "RecipeIngredients",
                keyColumns: new[] { "IngredientId", "RecipeId" },
                keyValues: new object[] { 6, 4 });

            migrationBuilder.DeleteData(
                table: "RecipeIngredients",
                keyColumns: new[] { "IngredientId", "RecipeId" },
                keyValues: new object[] { 8, 4 });

            migrationBuilder.DeleteData(
                table: "IngredientMeasurements",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "IngredientMeasurements",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "IngredientMeasurements",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "IngredientMeasurements",
                keyColumn: "Id",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "IngredientMeasurements",
                keyColumn: "Id",
                keyValue: 5);

            migrationBuilder.DeleteData(
                table: "IngredientMeasurements",
                keyColumn: "Id",
                keyValue: 6);

            migrationBuilder.DeleteData(
                table: "IngredientMeasurements",
                keyColumn: "Id",
                keyValue: 7);

            migrationBuilder.DeleteData(
                table: "IngredientMeasurements",
                keyColumn: "Id",
                keyValue: 8);

            migrationBuilder.DeleteData(
                table: "IngredientMeasurements",
                keyColumn: "Id",
                keyValue: 9);

            migrationBuilder.DeleteData(
                table: "IngredientMeasurements",
                keyColumn: "Id",
                keyValue: 10);

            migrationBuilder.DeleteData(
                table: "IngredientMeasurements",
                keyColumn: "Id",
                keyValue: 11);

            migrationBuilder.DeleteData(
                table: "IngredientMeasurements",
                keyColumn: "Id",
                keyValue: 12);

            migrationBuilder.DeleteData(
                table: "IngredientMeasurements",
                keyColumn: "Id",
                keyValue: 13);

            migrationBuilder.DeleteData(
                table: "IngredientMeasurements",
                keyColumn: "Id",
                keyValue: 14);

            migrationBuilder.DeleteData(
                table: "Recipes",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Recipes",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Recipes",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "Recipes",
                keyColumn: "Id",
                keyValue: 4);

            migrationBuilder.AddColumn<int>(
                name: "UserId",
                table: "Recipes",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_Recipes_UserId",
                table: "Recipes",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Recipes_UserId_Name",
                table: "Recipes",
                columns: new[] { "UserId", "Name" },
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Recipes_Users_UserId",
                table: "Recipes",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Recipes_Users_UserId",
                table: "Recipes");

            migrationBuilder.DropIndex(
                name: "IX_Recipes_UserId",
                table: "Recipes");

            migrationBuilder.DropIndex(
                name: "IX_Recipes_UserId_Name",
                table: "Recipes");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "Recipes");

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
                table: "Recipes",
                columns: new[] { "Id", "Calories", "Carbs", "CategoryId", "CookTime", "CreatedAt", "Description", "Difficulty", "Fat", "ImageUrl", "Instructions", "LastModified", "Name", "PrepTime", "Protein", "Rating", "Servings" },
                values: new object[,]
                {
                    { 1, null, null, 1, 15, new DateTimeOffset(new DateTime(2026, 5, 15, 15, 52, 2, 166, DateTimeKind.Unspecified).AddTicks(2433), new TimeSpan(0, 0, 0, 0, 0)), "Traditionella svenska kanelbullar", "Medel", null, null, "Blanda ingredienser och baka i 180°C i 15 minuter.", new DateTimeOffset(new DateTime(2021, 10, 10, 10, 30, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), "Kanelbullar", 45, null, 5, 4 },
                    { 2, null, null, 2, 0, new DateTimeOffset(new DateTime(2026, 5, 15, 15, 52, 2, 166, DateTimeKind.Unspecified).AddTicks(3730), new TimeSpan(0, 0, 0, 0, 0)), "En klassisk svensk räkmacka", "Medel", null, null, "Montera mackan med bröd, räkor, majonnäs och dill.", new DateTimeOffset(new DateTime(2021, 10, 10, 12, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), "Räkmacka", 10, null, 4, 2 },
                    { 3, null, null, 3, 120, new DateTimeOffset(new DateTime(2026, 5, 15, 15, 52, 2, 166, DateTimeKind.Unspecified).AddTicks(3734), new TimeSpan(0, 0, 0, 0, 0)), "Älgstek med enbär", "Medel", null, null, "Rosta älgköttet med enbär och servera med potatis och lingon.", new DateTimeOffset(new DateTime(2023, 10, 10, 15, 45, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), "Älgstek", 30, null, 5, 6 },
                    { 4, null, null, 4, 30, new DateTimeOffset(new DateTime(2026, 5, 15, 15, 52, 2, 166, DateTimeKind.Unspecified).AddTicks(3735), new TimeSpan(0, 0, 0, 0, 0)), "Lax i en krämig sås", "Medel", null, null, "Laga laxen i en gräddig sås med dill och servera med kokt potatis.", new DateTimeOffset(new DateTime(2024, 10, 10, 9, 15, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), "Lax med grädde", 20, null, 4, 4 }
                });

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
                name: "IX_Recipes_Name",
                table: "Recipes",
                column: "Name",
                unique: true);
        }
    }
}

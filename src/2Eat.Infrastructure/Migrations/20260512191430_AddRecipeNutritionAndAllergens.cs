using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace _2Eat.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddRecipeNutritionAndAllergens : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Calories",
                table: "Recipes",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "Carbs",
                table: "Recipes",
                type: "double precision",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "Fat",
                table: "Recipes",
                type: "double precision",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "Protein",
                table: "Recipes",
                type: "double precision",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "AllergenRecipe",
                columns: table => new
                {
                    AllergensId = table.Column<int>(type: "integer", nullable: false),
                    RecipesId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AllergenRecipe", x => new { x.AllergensId, x.RecipesId });
                    table.ForeignKey(
                        name: "FK_AllergenRecipe_Allergens_AllergensId",
                        column: x => x.AllergensId,
                        principalTable: "Allergens",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AllergenRecipe_Recipes_RecipesId",
                        column: x => x.RecipesId,
                        principalTable: "Recipes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.UpdateData(
                table: "Recipes",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "Calories", "Carbs", "CreatedAt", "Fat", "Protein" },
                values: new object[] { null, null, new DateTimeOffset(new DateTime(2026, 5, 12, 19, 14, 30, 367, DateTimeKind.Unspecified).AddTicks(9947), new TimeSpan(0, 0, 0, 0, 0)), null, null });

            migrationBuilder.UpdateData(
                table: "Recipes",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "Calories", "Carbs", "CreatedAt", "Fat", "Protein" },
                values: new object[] { null, null, new DateTimeOffset(new DateTime(2026, 5, 12, 19, 14, 30, 368, DateTimeKind.Unspecified).AddTicks(1226), new TimeSpan(0, 0, 0, 0, 0)), null, null });

            migrationBuilder.UpdateData(
                table: "Recipes",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "Calories", "Carbs", "CreatedAt", "Fat", "Protein" },
                values: new object[] { null, null, new DateTimeOffset(new DateTime(2026, 5, 12, 19, 14, 30, 368, DateTimeKind.Unspecified).AddTicks(1231), new TimeSpan(0, 0, 0, 0, 0)), null, null });

            migrationBuilder.UpdateData(
                table: "Recipes",
                keyColumn: "Id",
                keyValue: 4,
                columns: new[] { "Calories", "Carbs", "CreatedAt", "Fat", "Protein" },
                values: new object[] { null, null, new DateTimeOffset(new DateTime(2026, 5, 12, 19, 14, 30, 368, DateTimeKind.Unspecified).AddTicks(1240), new TimeSpan(0, 0, 0, 0, 0)), null, null });

            migrationBuilder.CreateIndex(
                name: "IX_AllergenRecipe_RecipesId",
                table: "AllergenRecipe",
                column: "RecipesId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AllergenRecipe");

            migrationBuilder.DropColumn(
                name: "Calories",
                table: "Recipes");

            migrationBuilder.DropColumn(
                name: "Carbs",
                table: "Recipes");

            migrationBuilder.DropColumn(
                name: "Fat",
                table: "Recipes");

            migrationBuilder.DropColumn(
                name: "Protein",
                table: "Recipes");

            migrationBuilder.UpdateData(
                table: "Recipes",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTimeOffset(new DateTime(2026, 5, 12, 18, 46, 0, 323, DateTimeKind.Unspecified).AddTicks(6061), new TimeSpan(0, 0, 0, 0, 0)));

            migrationBuilder.UpdateData(
                table: "Recipes",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTimeOffset(new DateTime(2026, 5, 12, 18, 46, 0, 323, DateTimeKind.Unspecified).AddTicks(7243), new TimeSpan(0, 0, 0, 0, 0)));

            migrationBuilder.UpdateData(
                table: "Recipes",
                keyColumn: "Id",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTimeOffset(new DateTime(2026, 5, 12, 18, 46, 0, 323, DateTimeKind.Unspecified).AddTicks(7247), new TimeSpan(0, 0, 0, 0, 0)));

            migrationBuilder.UpdateData(
                table: "Recipes",
                keyColumn: "Id",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTimeOffset(new DateTime(2026, 5, 12, 18, 46, 0, 323, DateTimeKind.Unspecified).AddTicks(7249), new TimeSpan(0, 0, 0, 0, 0)));
        }
    }
}

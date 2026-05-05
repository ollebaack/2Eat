using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace _2Eat.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddMealPlanAndPantry : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_MealPlans_Users_UserId",
                table: "MealPlans");

            migrationBuilder.DropIndex(
                name: "IX_MealPlans_UserId",
                table: "MealPlans");

            migrationBuilder.DropColumn(
                name: "Name",
                table: "MealPlans");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "MealPlans");

            migrationBuilder.AddColumn<DateOnly>(
                name: "WeekStartDate",
                table: "MealPlans",
                type: "date",
                nullable: false,
                defaultValue: new DateOnly(1, 1, 1));

            migrationBuilder.CreateTable(
                name: "MealPlanDays",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    MealPlanId = table.Column<int>(type: "integer", nullable: false),
                    DayOfWeek = table.Column<int>(type: "integer", nullable: false),
                    RecipeId = table.Column<int>(type: "integer", nullable: true),
                    Note = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MealPlanDays", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MealPlanDays_MealPlans_MealPlanId",
                        column: x => x.MealPlanId,
                        principalTable: "MealPlans",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PantryItems",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Category = table.Column<string>(type: "text", nullable: false),
                    Quantity = table.Column<double>(type: "double precision", nullable: false),
                    Unit = table.Column<string>(type: "text", nullable: false),
                    ExpiresAt = table.Column<DateOnly>(type: "date", nullable: true),
                    IsOpened = table.Column<bool>(type: "boolean", nullable: false),
                    IsLow = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PantryItems", x => x.Id);
                });

            migrationBuilder.UpdateData(
                table: "Recipes",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTimeOffset(new DateTime(2026, 5, 5, 21, 58, 54, 801, DateTimeKind.Unspecified).AddTicks(5512), new TimeSpan(0, 2, 0, 0, 0)));

            migrationBuilder.UpdateData(
                table: "Recipes",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "CreatedAt", "Difficulty" },
                values: new object[] { new DateTimeOffset(new DateTime(2026, 5, 5, 21, 58, 54, 801, DateTimeKind.Unspecified).AddTicks(7467), new TimeSpan(0, 2, 0, 0, 0)), "Medel" });

            migrationBuilder.UpdateData(
                table: "Recipes",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "CreatedAt", "Difficulty" },
                values: new object[] { new DateTimeOffset(new DateTime(2026, 5, 5, 21, 58, 54, 801, DateTimeKind.Unspecified).AddTicks(7471), new TimeSpan(0, 2, 0, 0, 0)), "Medel" });

            migrationBuilder.UpdateData(
                table: "Recipes",
                keyColumn: "Id",
                keyValue: 4,
                columns: new[] { "CreatedAt", "Difficulty" },
                values: new object[] { new DateTimeOffset(new DateTime(2026, 5, 5, 21, 58, 54, 801, DateTimeKind.Unspecified).AddTicks(7475), new TimeSpan(0, 2, 0, 0, 0)), "Medel" });

            migrationBuilder.CreateIndex(
                name: "IX_MealPlanDays_MealPlanId",
                table: "MealPlanDays",
                column: "MealPlanId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "MealPlanDays");

            migrationBuilder.DropTable(
                name: "PantryItems");

            migrationBuilder.DropColumn(
                name: "WeekStartDate",
                table: "MealPlans");

            migrationBuilder.AddColumn<string>(
                name: "Name",
                table: "MealPlans",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "UserId",
                table: "MealPlans",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.UpdateData(
                table: "Recipes",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTimeOffset(new DateTime(2026, 5, 3, 15, 1, 48, 78, DateTimeKind.Unspecified).AddTicks(2833), new TimeSpan(0, 2, 0, 0, 0)));

            migrationBuilder.UpdateData(
                table: "Recipes",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "CreatedAt", "Difficulty" },
                values: new object[] { new DateTimeOffset(new DateTime(2026, 5, 3, 15, 1, 48, 78, DateTimeKind.Unspecified).AddTicks(4192), new TimeSpan(0, 2, 0, 0, 0)), "Lätt" });

            migrationBuilder.UpdateData(
                table: "Recipes",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "CreatedAt", "Difficulty" },
                values: new object[] { new DateTimeOffset(new DateTime(2026, 5, 3, 15, 1, 48, 78, DateTimeKind.Unspecified).AddTicks(4197), new TimeSpan(0, 2, 0, 0, 0)), "Svår" });

            migrationBuilder.UpdateData(
                table: "Recipes",
                keyColumn: "Id",
                keyValue: 4,
                columns: new[] { "CreatedAt", "Difficulty" },
                values: new object[] { new DateTimeOffset(new DateTime(2026, 5, 3, 15, 1, 48, 78, DateTimeKind.Unspecified).AddTicks(4201), new TimeSpan(0, 2, 0, 0, 0)), "Lätt" });

            migrationBuilder.CreateIndex(
                name: "IX_MealPlans_UserId",
                table: "MealPlans",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_MealPlans_Users_UserId",
                table: "MealPlans",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}

using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace _2Eat.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddUserIdToMealPlanAndPantry : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "UserId",
                table: "PantryItems",
                type: "integer",
                nullable: false,
                defaultValue: 0);

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
                value: new DateTimeOffset(new DateTime(2026, 5, 7, 0, 1, 31, 512, DateTimeKind.Unspecified).AddTicks(5988), new TimeSpan(0, 2, 0, 0, 0)));

            migrationBuilder.UpdateData(
                table: "Recipes",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTimeOffset(new DateTime(2026, 5, 7, 0, 1, 31, 512, DateTimeKind.Unspecified).AddTicks(9144), new TimeSpan(0, 2, 0, 0, 0)));

            migrationBuilder.UpdateData(
                table: "Recipes",
                keyColumn: "Id",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTimeOffset(new DateTime(2026, 5, 7, 0, 1, 31, 512, DateTimeKind.Unspecified).AddTicks(9150), new TimeSpan(0, 2, 0, 0, 0)));

            migrationBuilder.UpdateData(
                table: "Recipes",
                keyColumn: "Id",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTimeOffset(new DateTime(2026, 5, 7, 0, 1, 31, 512, DateTimeKind.Unspecified).AddTicks(9155), new TimeSpan(0, 2, 0, 0, 0)));

            migrationBuilder.CreateIndex(
                name: "IX_PantryItems_UserId",
                table: "PantryItems",
                column: "UserId");

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

            migrationBuilder.AddForeignKey(
                name: "FK_PantryItems_Users_UserId",
                table: "PantryItems",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_MealPlans_Users_UserId",
                table: "MealPlans");

            migrationBuilder.DropForeignKey(
                name: "FK_PantryItems_Users_UserId",
                table: "PantryItems");

            migrationBuilder.DropIndex(
                name: "IX_PantryItems_UserId",
                table: "PantryItems");

            migrationBuilder.DropIndex(
                name: "IX_MealPlans_UserId",
                table: "MealPlans");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "PantryItems");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "MealPlans");

            migrationBuilder.UpdateData(
                table: "Recipes",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTimeOffset(new DateTime(2026, 5, 5, 23, 10, 3, 218, DateTimeKind.Unspecified).AddTicks(4544), new TimeSpan(0, 2, 0, 0, 0)));

            migrationBuilder.UpdateData(
                table: "Recipes",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTimeOffset(new DateTime(2026, 5, 5, 23, 10, 3, 218, DateTimeKind.Unspecified).AddTicks(6297), new TimeSpan(0, 2, 0, 0, 0)));

            migrationBuilder.UpdateData(
                table: "Recipes",
                keyColumn: "Id",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTimeOffset(new DateTime(2026, 5, 5, 23, 10, 3, 218, DateTimeKind.Unspecified).AddTicks(6302), new TimeSpan(0, 2, 0, 0, 0)));

            migrationBuilder.UpdateData(
                table: "Recipes",
                keyColumn: "Id",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTimeOffset(new DateTime(2026, 5, 5, 23, 10, 3, 218, DateTimeKind.Unspecified).AddTicks(6306), new TimeSpan(0, 2, 0, 0, 0)));
        }
    }
}

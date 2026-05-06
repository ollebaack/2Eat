using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace _2Eat.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddRecipeIsFavorite : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsFavorite",
                table: "Recipes",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.UpdateData(
                table: "Recipes",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "CreatedAt", "IsFavorite" },
                values: new object[] { new DateTimeOffset(new DateTime(2026, 5, 6, 23, 59, 28, 683, DateTimeKind.Unspecified).AddTicks(1022), new TimeSpan(0, 2, 0, 0, 0)), false });

            migrationBuilder.UpdateData(
                table: "Recipes",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "CreatedAt", "IsFavorite" },
                values: new object[] { new DateTimeOffset(new DateTime(2026, 5, 6, 23, 59, 28, 683, DateTimeKind.Unspecified).AddTicks(3192), new TimeSpan(0, 2, 0, 0, 0)), false });

            migrationBuilder.UpdateData(
                table: "Recipes",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "CreatedAt", "IsFavorite" },
                values: new object[] { new DateTimeOffset(new DateTime(2026, 5, 6, 23, 59, 28, 683, DateTimeKind.Unspecified).AddTicks(3214), new TimeSpan(0, 2, 0, 0, 0)), false });

            migrationBuilder.UpdateData(
                table: "Recipes",
                keyColumn: "Id",
                keyValue: 4,
                columns: new[] { "CreatedAt", "IsFavorite" },
                values: new object[] { new DateTimeOffset(new DateTime(2026, 5, 6, 23, 59, 28, 683, DateTimeKind.Unspecified).AddTicks(3217), new TimeSpan(0, 2, 0, 0, 0)), false });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsFavorite",
                table: "Recipes");

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

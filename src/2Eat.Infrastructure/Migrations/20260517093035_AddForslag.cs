using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace _2Eat.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddForslag : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Forslag",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Title = table.Column<string>(type: "text", nullable: false),
                    ImageUrl = table.Column<string>(type: "text", nullable: true),
                    SourceUrl = table.Column<string>(type: "text", nullable: false),
                    SourceSite = table.Column<string>(type: "text", nullable: false),
                    FetchedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Forslag", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "UserForslag",
                columns: table => new
                {
                    UserId = table.Column<int>(type: "integer", nullable: false),
                    ForslagId = table.Column<int>(type: "integer", nullable: false),
                    SeenAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserForslag", x => new { x.UserId, x.ForslagId });
                    table.ForeignKey(
                        name: "FK_UserForslag_Forslag_ForslagId",
                        column: x => x.ForslagId,
                        principalTable: "Forslag",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserForslag_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.UpdateData(
                table: "Recipes",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTimeOffset(new DateTime(2026, 5, 17, 9, 30, 35, 196, DateTimeKind.Unspecified).AddTicks(6108), new TimeSpan(0, 0, 0, 0, 0)));

            migrationBuilder.UpdateData(
                table: "Recipes",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTimeOffset(new DateTime(2026, 5, 17, 9, 30, 35, 196, DateTimeKind.Unspecified).AddTicks(7283), new TimeSpan(0, 0, 0, 0, 0)));

            migrationBuilder.UpdateData(
                table: "Recipes",
                keyColumn: "Id",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTimeOffset(new DateTime(2026, 5, 17, 9, 30, 35, 196, DateTimeKind.Unspecified).AddTicks(7286), new TimeSpan(0, 0, 0, 0, 0)));

            migrationBuilder.UpdateData(
                table: "Recipes",
                keyColumn: "Id",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTimeOffset(new DateTime(2026, 5, 17, 9, 30, 35, 196, DateTimeKind.Unspecified).AddTicks(7288), new TimeSpan(0, 0, 0, 0, 0)));

            migrationBuilder.CreateIndex(
                name: "IX_Forslag_FetchedAt",
                table: "Forslag",
                column: "FetchedAt");

            migrationBuilder.CreateIndex(
                name: "IX_Forslag_SourceSite",
                table: "Forslag",
                column: "SourceSite");

            migrationBuilder.CreateIndex(
                name: "IX_UserForslag_ForslagId",
                table: "UserForslag",
                column: "ForslagId");

            migrationBuilder.CreateIndex(
                name: "IX_UserForslag_UserId",
                table: "UserForslag",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "UserForslag");

            migrationBuilder.DropTable(
                name: "Forslag");

            migrationBuilder.UpdateData(
                table: "Recipes",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTimeOffset(new DateTime(2026, 5, 15, 15, 52, 2, 166, DateTimeKind.Unspecified).AddTicks(2433), new TimeSpan(0, 0, 0, 0, 0)));

            migrationBuilder.UpdateData(
                table: "Recipes",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTimeOffset(new DateTime(2026, 5, 15, 15, 52, 2, 166, DateTimeKind.Unspecified).AddTicks(3730), new TimeSpan(0, 0, 0, 0, 0)));

            migrationBuilder.UpdateData(
                table: "Recipes",
                keyColumn: "Id",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTimeOffset(new DateTime(2026, 5, 15, 15, 52, 2, 166, DateTimeKind.Unspecified).AddTicks(3734), new TimeSpan(0, 0, 0, 0, 0)));

            migrationBuilder.UpdateData(
                table: "Recipes",
                keyColumn: "Id",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTimeOffset(new DateTime(2026, 5, 15, 15, 52, 2, 166, DateTimeKind.Unspecified).AddTicks(3735), new TimeSpan(0, 0, 0, 0, 0)));
        }
    }
}

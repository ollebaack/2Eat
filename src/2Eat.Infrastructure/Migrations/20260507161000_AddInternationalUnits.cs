using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace _2Eat.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddInternationalUnits : Migration
    {
        // UnitOfMeasurement is stored as integer; new enum members do not require schema changes.

        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
        }
    }
}

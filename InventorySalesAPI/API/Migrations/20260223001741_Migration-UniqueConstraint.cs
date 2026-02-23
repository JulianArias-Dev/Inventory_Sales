using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace API.Migrations
{
    /// <inheritdoc />
    public partial class MigrationUniqueConstraint : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_Productos_Name",
                table: "Productos",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Categorias_Name",
                table: "Categorias",
                column: "Name",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Productos_Name",
                table: "Productos");

            migrationBuilder.DropIndex(
                name: "IX_Categorias_Name",
                table: "Categorias");
        }
    }
}

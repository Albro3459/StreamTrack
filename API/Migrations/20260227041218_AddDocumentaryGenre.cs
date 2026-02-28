using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace StreamTrack.Migrations
{
    /// <inheritdoc />
    public partial class AddDocumentaryGenre : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "Genre",
                columns: new[] { "GenreID", "IsDeleted", "Name" },
                values: new object[] { "9", false, "Documentary" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Genre",
                keyColumn: "GenreID",
                keyValue: "9");
        }
    }
}

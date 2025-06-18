using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace StreamTrack.Migrations
{
    /// <inheritdoc />
    public partial class Seed : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "Genre",
                columns: new[] { "GenreID", "IsDeleted", "Name" },
                values: new object[,]
                {
                    { "1", false, "Comedy" },
                    { "2", false, "Drama" }
                });

            migrationBuilder.InsertData(
                table: "User",
                columns: new[] { "UserID", "Email", "IsDeleted" },
                values: new object[] { "JMPOe14DyzcyxyVNBjqVjhssB5y2", "brodsky.alex22@gmail.com", false });

            migrationBuilder.InsertData(
                table: "UserGenre",
                columns: new[] { "GenresGenreID", "UsersUserID" },
                values: new object[,]
                {
                    { "1", "JMPOe14DyzcyxyVNBjqVjhssB5y2" },
                    { "2", "JMPOe14DyzcyxyVNBjqVjhssB5y2" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "UserGenre",
                keyColumns: new[] { "GenresGenreID", "UsersUserID" },
                keyValues: new object[] { "1", "JMPOe14DyzcyxyVNBjqVjhssB5y2" });

            migrationBuilder.DeleteData(
                table: "UserGenre",
                keyColumns: new[] { "GenresGenreID", "UsersUserID" },
                keyValues: new object[] { "2", "JMPOe14DyzcyxyVNBjqVjhssB5y2" });

            migrationBuilder.DeleteData(
                table: "Genre",
                keyColumn: "GenreID",
                keyValue: "1");

            migrationBuilder.DeleteData(
                table: "Genre",
                keyColumn: "GenreID",
                keyValue: "2");

            migrationBuilder.DeleteData(
                table: "User",
                keyColumn: "UserID",
                keyValue: "JMPOe14DyzcyxyVNBjqVjhssB5y2");
        }
    }
}

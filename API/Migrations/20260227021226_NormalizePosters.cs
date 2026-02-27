using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace StreamTrack.Migrations
{
    /// <inheritdoc />
    public partial class NormalizePosters : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "HorizontalPoster",
                table: "ContentPartial");

            migrationBuilder.DropColumn(
                name: "LargeVerticalPoster",
                table: "ContentPartial");

            migrationBuilder.DropColumn(
                name: "VerticalPoster",
                table: "ContentPartial");

            migrationBuilder.DropColumn(
                name: "HorizontalPoster",
                table: "ContentDetail");

            migrationBuilder.DropColumn(
                name: "LargeVerticalPoster",
                table: "ContentDetail");

            migrationBuilder.DropColumn(
                name: "VerticalPoster",
                table: "ContentDetail");

            migrationBuilder.CreateTable(
                name: "Poster",
                columns: table => new
                {
                    TMDB_ID = table.Column<string>(type: "text", nullable: false),
                    VerticalPoster = table.Column<string>(type: "text", nullable: false),
                    LargeVerticalPoster = table.Column<string>(type: "text", nullable: false),
                    HorizontalPoster = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Poster", x => x.TMDB_ID);
                    table.ForeignKey(
                        name: "FK_Poster_ContentPartial_TMDB_ID",
                        column: x => x.TMDB_ID,
                        principalTable: "ContentPartial",
                        principalColumn: "TMDB_ID",
                        onDelete: ReferentialAction.Cascade);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Poster");

            migrationBuilder.AddColumn<string>(
                name: "HorizontalPoster",
                table: "ContentPartial",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "LargeVerticalPoster",
                table: "ContentPartial",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "VerticalPoster",
                table: "ContentPartial",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "HorizontalPoster",
                table: "ContentDetail",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "LargeVerticalPoster",
                table: "ContentDetail",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "VerticalPoster",
                table: "ContentDetail",
                type: "text",
                nullable: false,
                defaultValue: "");
        }
    }
}

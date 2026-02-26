using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Infrastructure;
using API.Infrastructure;

#nullable disable

namespace StreamTrack.Migrations
{
    /// <inheritdoc />
    [DbContext(typeof(StreamTrackDbContext))]
    [Migration("20260226200000_NormalizePosters")]
    public partial class NormalizePosters : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
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

            migrationBuilder.Sql(
                """
                INSERT INTO "Poster" ("TMDB_ID", "VerticalPoster", "LargeVerticalPoster", "HorizontalPoster")
                SELECT
                    cp."TMDB_ID",
                    COALESCE(NULLIF(cd."VerticalPoster", ''), NULLIF(cp."VerticalPoster", ''), ''),
                    COALESCE(NULLIF(cd."LargeVerticalPoster", ''), NULLIF(cp."LargeVerticalPoster", ''), ''),
                    COALESCE(NULLIF(cd."HorizontalPoster", ''), NULLIF(cp."HorizontalPoster", ''), '')
                FROM "ContentPartial" cp
                LEFT JOIN "ContentDetail" cd ON cd."TMDB_ID" = cp."TMDB_ID";
                """);

            migrationBuilder.DropColumn(
                name: "VerticalPoster",
                table: "ContentDetail");

            migrationBuilder.DropColumn(
                name: "LargeVerticalPoster",
                table: "ContentDetail");

            migrationBuilder.DropColumn(
                name: "HorizontalPoster",
                table: "ContentDetail");

            migrationBuilder.DropColumn(
                name: "VerticalPoster",
                table: "ContentPartial");

            migrationBuilder.DropColumn(
                name: "LargeVerticalPoster",
                table: "ContentPartial");

            migrationBuilder.DropColumn(
                name: "HorizontalPoster",
                table: "ContentPartial");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "VerticalPoster",
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
                name: "HorizontalPoster",
                table: "ContentDetail",
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
                name: "LargeVerticalPoster",
                table: "ContentPartial",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "HorizontalPoster",
                table: "ContentPartial",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.Sql(
                """
                UPDATE "ContentPartial" cp
                SET
                    "VerticalPoster" = COALESCE(po."VerticalPoster", ''),
                    "LargeVerticalPoster" = COALESCE(po."LargeVerticalPoster", ''),
                    "HorizontalPoster" = COALESCE(po."HorizontalPoster", '')
                FROM "Poster" po
                WHERE cp."TMDB_ID" = po."TMDB_ID";
                """);

            migrationBuilder.Sql(
                """
                UPDATE "ContentDetail" cd
                SET
                    "VerticalPoster" = COALESCE(po."VerticalPoster", ''),
                    "LargeVerticalPoster" = COALESCE(po."LargeVerticalPoster", ''),
                    "HorizontalPoster" = COALESCE(po."HorizontalPoster", '')
                FROM "Poster" po
                WHERE cd."TMDB_ID" = po."TMDB_ID";
                """);

            migrationBuilder.DropTable(
                name: "Poster");
        }
    }
}

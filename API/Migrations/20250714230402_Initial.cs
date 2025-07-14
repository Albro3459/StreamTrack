using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace StreamTrack.Migrations
{
    /// <inheritdoc />
    public partial class Initial : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ContentPartial",
                columns: table => new
                {
                    TMDB_ID = table.Column<string>(type: "text", nullable: false),
                    Title = table.Column<string>(type: "text", nullable: false),
                    Overview = table.Column<string>(type: "text", nullable: false),
                    Rating = table.Column<double>(type: "double precision", nullable: false),
                    ReleaseYear = table.Column<int>(type: "integer", nullable: false),
                    VerticalPoster = table.Column<string>(type: "text", nullable: false),
                    LargeVerticalPoster = table.Column<string>(type: "text", nullable: false),
                    HorizontalPoster = table.Column<string>(type: "text", nullable: false),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ContentPartial", x => x.TMDB_ID);
                });

            migrationBuilder.CreateTable(
                name: "Genre",
                columns: table => new
                {
                    GenreID = table.Column<string>(type: "text", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Genre", x => x.GenreID);
                });

            migrationBuilder.CreateTable(
                name: "StreamingService",
                columns: table => new
                {
                    ServiceID = table.Column<string>(type: "text", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    LightLogo = table.Column<string>(type: "text", nullable: false),
                    DarkLogo = table.Column<string>(type: "text", nullable: false),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StreamingService", x => x.ServiceID);
                });

            migrationBuilder.CreateTable(
                name: "User",
                columns: table => new
                {
                    UserID = table.Column<string>(type: "text", nullable: false),
                    Email = table.Column<string>(type: "text", nullable: false),
                    FirstName = table.Column<string>(type: "text", nullable: false),
                    LastName = table.Column<string>(type: "text", nullable: false),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_User", x => x.UserID);
                });

            migrationBuilder.CreateTable(
                name: "ContentDetail",
                columns: table => new
                {
                    TMDB_ID = table.Column<string>(type: "text", nullable: false),
                    IsPopular = table.Column<bool>(type: "boolean", nullable: false),
                    Title = table.Column<string>(type: "text", nullable: false),
                    Overview = table.Column<string>(type: "text", nullable: false),
                    ReleaseYear = table.Column<int>(type: "integer", nullable: false),
                    RapidID = table.Column<string>(type: "text", nullable: false),
                    IMDB_ID = table.Column<string>(type: "text", nullable: false),
                    ShowType = table.Column<string>(type: "text", nullable: false),
                    Cast = table.Column<string>(type: "text", nullable: false),
                    Directors = table.Column<string>(type: "text", nullable: false),
                    Rating = table.Column<double>(type: "double precision", nullable: false),
                    Runtime = table.Column<int>(type: "integer", nullable: true),
                    SeasonCount = table.Column<int>(type: "integer", nullable: true),
                    EpisodeCount = table.Column<int>(type: "integer", nullable: true),
                    VerticalPoster = table.Column<string>(type: "text", nullable: false),
                    LargeVerticalPoster = table.Column<string>(type: "text", nullable: false),
                    HorizontalPoster = table.Column<string>(type: "text", nullable: false),
                    TTL_UTC = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ContentDetail", x => x.TMDB_ID);
                    table.ForeignKey(
                        name: "FK_ContentDetail_ContentPartial_TMDB_ID",
                        column: x => x.TMDB_ID,
                        principalTable: "ContentPartial",
                        principalColumn: "TMDB_ID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "List",
                columns: table => new
                {
                    ListID = table.Column<string>(type: "text", nullable: false),
                    OwnerUserID = table.Column<string>(type: "text", nullable: false),
                    ListName = table.Column<string>(type: "text", nullable: false),
                    Version = table.Column<byte[]>(type: "bytea", rowVersion: true, nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_List", x => x.ListID);
                    table.ForeignKey(
                        name: "FK_List_User_OwnerUserID",
                        column: x => x.OwnerUserID,
                        principalTable: "User",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserGenre",
                columns: table => new
                {
                    GenresGenreID = table.Column<string>(type: "text", nullable: false),
                    UsersUserID = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserGenre", x => new { x.GenresGenreID, x.UsersUserID });
                    table.ForeignKey(
                        name: "FK_UserGenre_Genre_GenresGenreID",
                        column: x => x.GenresGenreID,
                        principalTable: "Genre",
                        principalColumn: "GenreID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserGenre_User_UsersUserID",
                        column: x => x.UsersUserID,
                        principalTable: "User",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserService",
                columns: table => new
                {
                    StreamingServicesServiceID = table.Column<string>(type: "text", nullable: false),
                    UsersUserID = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserService", x => new { x.StreamingServicesServiceID, x.UsersUserID });
                    table.ForeignKey(
                        name: "FK_UserService_StreamingService_StreamingServicesServiceID",
                        column: x => x.StreamingServicesServiceID,
                        principalTable: "StreamingService",
                        principalColumn: "ServiceID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserService_User_UsersUserID",
                        column: x => x.UsersUserID,
                        principalTable: "User",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ContentGenre",
                columns: table => new
                {
                    ContentDetailsTMDB_ID = table.Column<string>(type: "text", nullable: false),
                    GenresGenreID = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ContentGenre", x => new { x.ContentDetailsTMDB_ID, x.GenresGenreID });
                    table.ForeignKey(
                        name: "FK_ContentGenre_ContentDetail_ContentDetailsTMDB_ID",
                        column: x => x.ContentDetailsTMDB_ID,
                        principalTable: "ContentDetail",
                        principalColumn: "TMDB_ID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ContentGenre_Genre_GenresGenreID",
                        column: x => x.GenresGenreID,
                        principalTable: "Genre",
                        principalColumn: "GenreID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "StreamingOption",
                columns: table => new
                {
                    TMDB_ID = table.Column<string>(type: "text", nullable: false),
                    ServiceID = table.Column<string>(type: "text", nullable: false),
                    Type = table.Column<string>(type: "text", nullable: false),
                    Price = table.Column<string>(type: "text", nullable: true),
                    DeepLink = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StreamingOption", x => new { x.TMDB_ID, x.ServiceID });
                    table.ForeignKey(
                        name: "FK_StreamingOption_ContentDetail_TMDB_ID",
                        column: x => x.TMDB_ID,
                        principalTable: "ContentDetail",
                        principalColumn: "TMDB_ID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_StreamingOption_StreamingService_ServiceID",
                        column: x => x.ServiceID,
                        principalTable: "StreamingService",
                        principalColumn: "ServiceID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ListContent",
                columns: table => new
                {
                    ContentPartialsTMDB_ID = table.Column<string>(type: "text", nullable: false),
                    ListsListID = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ListContent", x => new { x.ContentPartialsTMDB_ID, x.ListsListID });
                    table.ForeignKey(
                        name: "FK_ListContent_ContentPartial_ContentPartialsTMDB_ID",
                        column: x => x.ContentPartialsTMDB_ID,
                        principalTable: "ContentPartial",
                        principalColumn: "TMDB_ID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ListContent_List_ListsListID",
                        column: x => x.ListsListID,
                        principalTable: "List",
                        principalColumn: "ListID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ListShares",
                columns: table => new
                {
                    ListID = table.Column<string>(type: "text", nullable: false),
                    UserID = table.Column<string>(type: "text", nullable: false),
                    Permission = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ListShares", x => new { x.ListID, x.UserID });
                    table.ForeignKey(
                        name: "FK_ListShares_List_ListID",
                        column: x => x.ListID,
                        principalTable: "List",
                        principalColumn: "ListID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ListShares_User_UserID",
                        column: x => x.UserID,
                        principalTable: "User",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "Genre",
                columns: new[] { "GenreID", "IsDeleted", "Name" },
                values: new object[,]
                {
                    { "1", false, "Action" },
                    { "2", false, "Comedy" },
                    { "3", false, "Drama" },
                    { "4", false, "Horror" },
                    { "5", false, "Romance" },
                    { "6", false, "Science Fiction" },
                    { "7", false, "Thriller" },
                    { "8", false, "Western" }
                });

            migrationBuilder.InsertData(
                table: "StreamingService",
                columns: new[] { "ServiceID", "DarkLogo", "IsDeleted", "LightLogo", "Name" },
                values: new object[,]
                {
                    { "1", "https://media.movieofthenight.com/services/netflix/logo-dark-theme.svg", false, "https://media.movieofthenight.com/services/netflix/logo-light-theme.svg", "Netflix" },
                    { "2", "https://media.movieofthenight.com/services/hulu/logo-dark-theme.svg", false, "https://media.movieofthenight.com/services/hulu/logo-light-theme.svg", "Hulu" },
                    { "3", "https://media.movieofthenight.com/services/max/logo-dark-theme.svg", false, "https://media.movieofthenight.com/services/max/logo-light-theme.svg", "Max" },
                    { "4", "https://media.movieofthenight.com/services/prime/logo-dark-theme.svg", false, "https://media.movieofthenight.com/services/prime/logo-light-theme.svg", "Prime Video" },
                    { "5", "https://media.movieofthenight.com/services/disney/logo-dark-theme.svg", false, "https://media.movieofthenight.com/services/disney/logo-light-theme.svg", "Disney+" },
                    { "6", "https://media.movieofthenight.com/services/apple/logo-dark-theme.svg", false, "https://media.movieofthenight.com/services/apple/logo-light-theme.svg", "Apple TV" },
                    { "7", "https://media.movieofthenight.com/services/paramount/logo-dark-theme.svg", false, "https://media.movieofthenight.com/services/paramount/logo-light-theme.svg", "Paramount+" },
                    { "8", "https://media.movieofthenight.com/services/peacock/logo-dark-theme.svg", false, "https://media.movieofthenight.com/services/peacock/logo-light-theme.svg", "Peacock" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_ContentGenre_GenresGenreID",
                table: "ContentGenre",
                column: "GenresGenreID");

            migrationBuilder.CreateIndex(
                name: "IX_List_OwnerUserID",
                table: "List",
                column: "OwnerUserID");

            migrationBuilder.CreateIndex(
                name: "IX_ListContent_ListsListID",
                table: "ListContent",
                column: "ListsListID");

            migrationBuilder.CreateIndex(
                name: "IX_ListShares_UserID",
                table: "ListShares",
                column: "UserID");

            migrationBuilder.CreateIndex(
                name: "IX_StreamingOption_ServiceID",
                table: "StreamingOption",
                column: "ServiceID");

            migrationBuilder.CreateIndex(
                name: "IX_User_Email",
                table: "User",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_UserGenre_UsersUserID",
                table: "UserGenre",
                column: "UsersUserID");

            migrationBuilder.CreateIndex(
                name: "IX_UserService_UsersUserID",
                table: "UserService",
                column: "UsersUserID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ContentGenre");

            migrationBuilder.DropTable(
                name: "ListContent");

            migrationBuilder.DropTable(
                name: "ListShares");

            migrationBuilder.DropTable(
                name: "StreamingOption");

            migrationBuilder.DropTable(
                name: "UserGenre");

            migrationBuilder.DropTable(
                name: "UserService");

            migrationBuilder.DropTable(
                name: "List");

            migrationBuilder.DropTable(
                name: "ContentDetail");

            migrationBuilder.DropTable(
                name: "Genre");

            migrationBuilder.DropTable(
                name: "StreamingService");

            migrationBuilder.DropTable(
                name: "User");

            migrationBuilder.DropTable(
                name: "ContentPartial");
        }
    }
}

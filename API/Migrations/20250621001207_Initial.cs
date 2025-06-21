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
                name: "Content",
                columns: table => new
                {
                    ContentID = table.Column<string>(type: "TEXT", nullable: false),
                    Title = table.Column<string>(type: "TEXT", nullable: false),
                    Overview = table.Column<string>(type: "TEXT", nullable: false),
                    ReleaseYear = table.Column<int>(type: "INTEGER", nullable: false),
                    IMDB_ID = table.Column<string>(type: "TEXT", nullable: false),
                    TMDB_ID = table.Column<string>(type: "TEXT", nullable: false),
                    ShowType = table.Column<string>(type: "TEXT", nullable: false),
                    Cast = table.Column<string>(type: "TEXT", nullable: false),
                    Directors = table.Column<string>(type: "TEXT", nullable: false),
                    Rating = table.Column<int>(type: "INTEGER", nullable: false),
                    Runtime = table.Column<int>(type: "INTEGER", nullable: true),
                    SeasonCount = table.Column<int>(type: "INTEGER", nullable: true),
                    EpisodeCount = table.Column<int>(type: "INTEGER", nullable: true),
                    VerticalPoster = table.Column<string>(type: "TEXT", nullable: false),
                    HorizontalPoster = table.Column<string>(type: "TEXT", nullable: false),
                    IsDeleted = table.Column<bool>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Content", x => x.ContentID);
                });

            migrationBuilder.CreateTable(
                name: "Genre",
                columns: table => new
                {
                    GenreID = table.Column<string>(type: "TEXT", nullable: false),
                    Name = table.Column<string>(type: "TEXT", nullable: false),
                    IsDeleted = table.Column<bool>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Genre", x => x.GenreID);
                });

            migrationBuilder.CreateTable(
                name: "StreamingService",
                columns: table => new
                {
                    ServiceID = table.Column<string>(type: "TEXT", nullable: false),
                    Name = table.Column<string>(type: "TEXT", nullable: false),
                    Logo = table.Column<string>(type: "TEXT", nullable: false),
                    IsDeleted = table.Column<bool>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StreamingService", x => x.ServiceID);
                });

            migrationBuilder.CreateTable(
                name: "User",
                columns: table => new
                {
                    UserID = table.Column<string>(type: "TEXT", nullable: false),
                    Email = table.Column<string>(type: "TEXT", nullable: false),
                    FirstName = table.Column<string>(type: "TEXT", nullable: false),
                    LastName = table.Column<string>(type: "TEXT", nullable: false),
                    IsDeleted = table.Column<bool>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_User", x => x.UserID);
                });

            migrationBuilder.CreateTable(
                name: "ContentGenre",
                columns: table => new
                {
                    ContentsContentID = table.Column<string>(type: "TEXT", nullable: false),
                    GenresGenreID = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ContentGenre", x => new { x.ContentsContentID, x.GenresGenreID });
                    table.ForeignKey(
                        name: "FK_ContentGenre_Content_ContentsContentID",
                        column: x => x.ContentsContentID,
                        principalTable: "Content",
                        principalColumn: "ContentID",
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
                    ContentID = table.Column<string>(type: "TEXT", nullable: false),
                    ServiceID = table.Column<string>(type: "TEXT", nullable: false),
                    Type = table.Column<string>(type: "TEXT", nullable: false),
                    Price = table.Column<string>(type: "TEXT", nullable: true),
                    DeepLink = table.Column<string>(type: "TEXT", nullable: false),
                    IsDeleted = table.Column<bool>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StreamingOption", x => new { x.ContentID, x.ServiceID });
                    table.ForeignKey(
                        name: "FK_StreamingOption_Content_ContentID",
                        column: x => x.ContentID,
                        principalTable: "Content",
                        principalColumn: "ContentID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_StreamingOption_StreamingService_ServiceID",
                        column: x => x.ServiceID,
                        principalTable: "StreamingService",
                        principalColumn: "ServiceID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "List",
                columns: table => new
                {
                    ListID = table.Column<string>(type: "TEXT", nullable: false),
                    OwnerUserID = table.Column<string>(type: "TEXT", nullable: false),
                    ListName = table.Column<string>(type: "TEXT", nullable: false),
                    Version = table.Column<byte[]>(type: "BLOB", rowVersion: true, nullable: false),
                    IsDeleted = table.Column<bool>(type: "INTEGER", nullable: false)
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
                    GenresGenreID = table.Column<string>(type: "TEXT", nullable: false),
                    UsersUserID = table.Column<string>(type: "TEXT", nullable: false)
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
                    StreamingServicesServiceID = table.Column<string>(type: "TEXT", nullable: false),
                    UsersUserID = table.Column<string>(type: "TEXT", nullable: false)
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
                name: "ListContent",
                columns: table => new
                {
                    ContentsContentID = table.Column<string>(type: "TEXT", nullable: false),
                    ListsListID = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ListContent", x => new { x.ContentsContentID, x.ListsListID });
                    table.ForeignKey(
                        name: "FK_ListContent_Content_ContentsContentID",
                        column: x => x.ContentsContentID,
                        principalTable: "Content",
                        principalColumn: "ContentID",
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
                    ListID = table.Column<string>(type: "TEXT", nullable: false),
                    UserID = table.Column<string>(type: "TEXT", nullable: false),
                    Permission = table.Column<string>(type: "TEXT", nullable: false),
                    IsDeleted = table.Column<bool>(type: "INTEGER", nullable: false)
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
                    { "6", false, "Rom-Com" },
                    { "7", false, "Sci-Fi" },
                    { "8", false, "Thriller" },
                    { "9", false, "Western" }
                });

            migrationBuilder.InsertData(
                table: "StreamingService",
                columns: new[] { "ServiceID", "IsDeleted", "Logo", "Name" },
                values: new object[,]
                {
                    { "1", false, "https://media.movieofthenight.com/services/netflix/logo-dark-theme.svg", "Netflix" },
                    { "2", false, "https://media.movieofthenight.com/services/hulu/logo-dark-theme.svg", "Hulu" },
                    { "3", false, "https://media.movieofthenight.com/services/max/logo-dark-theme.svg", "HBO Max" },
                    { "4", false, "https://media.movieofthenight.com/services/prime/logo-dark-theme.svg", "Amazon Prime" },
                    { "5", false, "https://media.movieofthenight.com/services/disney/logo-dark-theme.svg", "Disney+" },
                    { "6", false, "https://media.movieofthenight.com/services/apple/logo-dark-theme.svg", "Apple TV" },
                    { "7", false, "https://media.movieofthenight.com/services/paramount/logo-dark-theme.svg", "Paramount+" },
                    { "8", false, "https://media.movieofthenight.com/services/peacock/logo-dark-theme.svg", "Peacock" }
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
                name: "Content");

            migrationBuilder.DropTable(
                name: "Genre");

            migrationBuilder.DropTable(
                name: "StreamingService");

            migrationBuilder.DropTable(
                name: "User");
        }
    }
}

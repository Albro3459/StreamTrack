CREATE TABLE "ContentPartial" (
    "TMDB_ID" TEXT NOT NULL CONSTRAINT "PK_ContentPartial" PRIMARY KEY,
    "Title" TEXT NOT NULL,
    "Overview" TEXT NOT NULL,
    "Rating" REAL NOT NULL,
    "ReleaseYear" INTEGER NOT NULL,
    "VerticalPoster" TEXT NOT NULL,
    "LargeVerticalPoster" TEXT NOT NULL,
    "HorizontalPoster" TEXT NOT NULL,
    "IsDeleted" INTEGER NOT NULL
);

CREATE TABLE "Genre" (
    "GenreID" TEXT NOT NULL CONSTRAINT "PK_Genre" PRIMARY KEY,
    "Name" TEXT NOT NULL,
    "IsDeleted" INTEGER NOT NULL
);

CREATE TABLE "StreamingService" (
    "ServiceID" TEXT NOT NULL CONSTRAINT "PK_StreamingService" PRIMARY KEY,
    "Name" TEXT NOT NULL,
    "LightLogo" TEXT NOT NULL,
    "DarkLogo" TEXT NOT NULL,
    "IsDeleted" INTEGER NOT NULL
);

CREATE TABLE "User" (
    "UserID" TEXT NOT NULL CONSTRAINT "PK_User" PRIMARY KEY,
    "Email" TEXT NOT NULL,
    "FirstName" TEXT NOT NULL,
    "LastName" TEXT NOT NULL,
    "IsDeleted" INTEGER NOT NULL
);

CREATE TABLE "ContentDetail" (
    "TMDB_ID" TEXT NOT NULL CONSTRAINT "PK_ContentDetail" PRIMARY KEY,
    "IsPopular" INTEGER NOT NULL,
    "Title" TEXT NOT NULL,
    "Overview" TEXT NOT NULL,
    "ReleaseYear" INTEGER NOT NULL,
    "RapidID" TEXT NOT NULL,
    "IMDB_ID" TEXT NOT NULL,
    "ShowType" TEXT NOT NULL,
    "Cast" TEXT NOT NULL,
    "Directors" TEXT NOT NULL,
    "Rating" REAL NOT NULL,
    "Runtime" INTEGER NULL,
    "SeasonCount" INTEGER NULL,
    "EpisodeCount" INTEGER NULL,
    "VerticalPoster" TEXT NOT NULL,
    "LargeVerticalPoster" TEXT NOT NULL,
    "HorizontalPoster" TEXT NOT NULL,
    "TTL_UTC" TEXT NOT NULL,
    "IsDeleted" INTEGER NOT NULL,
    CONSTRAINT "FK_ContentDetail_ContentPartial_TMDB_ID" FOREIGN KEY ("TMDB_ID") REFERENCES "ContentPartial" ("TMDB_ID") ON DELETE CASCADE
);

CREATE TABLE "List" (
    "ListID" TEXT NOT NULL CONSTRAINT "PK_List" PRIMARY KEY,
    "OwnerUserID" TEXT NOT NULL,
    "ListName" TEXT NOT NULL,
    "Version" BLOB NULL,
    "IsDeleted" INTEGER NOT NULL,
    CONSTRAINT "FK_List_User_OwnerUserID" FOREIGN KEY ("OwnerUserID") REFERENCES "User" ("UserID") ON DELETE CASCADE
);

CREATE TABLE "UserGenre" (
    "GenresGenreID" TEXT NOT NULL,
    "UsersUserID" TEXT NOT NULL,
    CONSTRAINT "PK_UserGenre" PRIMARY KEY ("GenresGenreID", "UsersUserID"),
    CONSTRAINT "FK_UserGenre_Genre_GenresGenreID" FOREIGN KEY ("GenresGenreID") REFERENCES "Genre" ("GenreID") ON DELETE CASCADE,
    CONSTRAINT "FK_UserGenre_User_UsersUserID" FOREIGN KEY ("UsersUserID") REFERENCES "User" ("UserID") ON DELETE CASCADE
);

CREATE TABLE "UserService" (
    "StreamingServicesServiceID" TEXT NOT NULL,
    "UsersUserID" TEXT NOT NULL,
    CONSTRAINT "PK_UserService" PRIMARY KEY ("StreamingServicesServiceID", "UsersUserID"),
    CONSTRAINT "FK_UserService_StreamingService_StreamingServicesServiceID" FOREIGN KEY ("StreamingServicesServiceID") REFERENCES "StreamingService" ("ServiceID") ON DELETE CASCADE,
    CONSTRAINT "FK_UserService_User_UsersUserID" FOREIGN KEY ("UsersUserID") REFERENCES "User" ("UserID") ON DELETE CASCADE
);

CREATE TABLE "ContentGenre" (
    "ContentDetailsTMDB_ID" TEXT NOT NULL,
    "GenresGenreID" TEXT NOT NULL,
    CONSTRAINT "PK_ContentGenre" PRIMARY KEY ("ContentDetailsTMDB_ID", "GenresGenreID"),
    CONSTRAINT "FK_ContentGenre_ContentDetail_ContentDetailsTMDB_ID" FOREIGN KEY ("ContentDetailsTMDB_ID") REFERENCES "ContentDetail" ("TMDB_ID") ON DELETE CASCADE,
    CONSTRAINT "FK_ContentGenre_Genre_GenresGenreID" FOREIGN KEY ("GenresGenreID") REFERENCES "Genre" ("GenreID") ON DELETE CASCADE
);

CREATE TABLE "StreamingOption" (
    "TMDB_ID" TEXT NOT NULL,
    "ServiceID" TEXT NOT NULL,
    "Type" TEXT NOT NULL,
    "Price" TEXT NULL,
    "DeepLink" TEXT NOT NULL,
    CONSTRAINT "PK_StreamingOption" PRIMARY KEY ("TMDB_ID", "ServiceID"),
    CONSTRAINT "FK_StreamingOption_ContentDetail_TMDB_ID" FOREIGN KEY ("TMDB_ID") REFERENCES "ContentDetail" ("TMDB_ID") ON DELETE CASCADE,
    CONSTRAINT "FK_StreamingOption_StreamingService_ServiceID" FOREIGN KEY ("ServiceID") REFERENCES "StreamingService" ("ServiceID") ON DELETE CASCADE
);

CREATE TABLE "ListContent" (
    "ContentPartialsTMDB_ID" TEXT NOT NULL,
    "ListsListID" TEXT NOT NULL,
    CONSTRAINT "PK_ListContent" PRIMARY KEY ("ContentPartialsTMDB_ID", "ListsListID"),
    CONSTRAINT "FK_ListContent_ContentPartial_ContentPartialsTMDB_ID" FOREIGN KEY ("ContentPartialsTMDB_ID") REFERENCES "ContentPartial" ("TMDB_ID") ON DELETE CASCADE,
    CONSTRAINT "FK_ListContent_List_ListsListID" FOREIGN KEY ("ListsListID") REFERENCES "List" ("ListID") ON DELETE CASCADE
);

CREATE TABLE "ListShares" (
    "ListID" TEXT NOT NULL,
    "UserID" TEXT NOT NULL,
    "Permission" TEXT NOT NULL,
    CONSTRAINT "PK_ListShares" PRIMARY KEY ("ListID", "UserID"),
    CONSTRAINT "FK_ListShares_List_ListID" FOREIGN KEY ("ListID") REFERENCES "List" ("ListID") ON DELETE CASCADE,
    CONSTRAINT "FK_ListShares_User_UserID" FOREIGN KEY ("UserID") REFERENCES "User" ("UserID") ON DELETE CASCADE
);

INSERT INTO "Genre" ("GenreID", "IsDeleted", "Name")
VALUES ('1', 0, 'Action');
SELECT changes();

INSERT INTO "Genre" ("GenreID", "IsDeleted", "Name")
VALUES ('2', 0, 'Comedy');
SELECT changes();

INSERT INTO "Genre" ("GenreID", "IsDeleted", "Name")
VALUES ('3', 0, 'Drama');
SELECT changes();

INSERT INTO "Genre" ("GenreID", "IsDeleted", "Name")
VALUES ('4', 0, 'Horror');
SELECT changes();

INSERT INTO "Genre" ("GenreID", "IsDeleted", "Name")
VALUES ('5', 0, 'Romance');
SELECT changes();

INSERT INTO "Genre" ("GenreID", "IsDeleted", "Name")
VALUES ('6', 0, 'Science Fiction');
SELECT changes();

INSERT INTO "Genre" ("GenreID", "IsDeleted", "Name")
VALUES ('7', 0, 'Thriller');
SELECT changes();

INSERT INTO "Genre" ("GenreID", "IsDeleted", "Name")
VALUES ('8', 0, 'Western');
SELECT changes();


INSERT INTO "StreamingService" ("ServiceID", "DarkLogo", "IsDeleted", "LightLogo", "Name")
VALUES ('1', 'https://media.movieofthenight.com/services/netflix/logo-dark-theme.svg', 0, 'https://media.movieofthenight.com/services/netflix/logo-light-theme.svg', 'Netflix');
SELECT changes();

INSERT INTO "StreamingService" ("ServiceID", "DarkLogo", "IsDeleted", "LightLogo", "Name")
VALUES ('2', 'https://media.movieofthenight.com/services/hulu/logo-dark-theme.svg', 0, 'https://media.movieofthenight.com/services/hulu/logo-light-theme.svg', 'Hulu');
SELECT changes();

INSERT INTO "StreamingService" ("ServiceID", "DarkLogo", "IsDeleted", "LightLogo", "Name")
VALUES ('3', 'https://media.movieofthenight.com/services/max/logo-dark-theme.svg', 0, 'https://media.movieofthenight.com/services/max/logo-light-theme.svg', 'Max');
SELECT changes();

INSERT INTO "StreamingService" ("ServiceID", "DarkLogo", "IsDeleted", "LightLogo", "Name")
VALUES ('4', 'https://media.movieofthenight.com/services/prime/logo-dark-theme.svg', 0, 'https://media.movieofthenight.com/services/prime/logo-light-theme.svg', 'Prime Video');
SELECT changes();

INSERT INTO "StreamingService" ("ServiceID", "DarkLogo", "IsDeleted", "LightLogo", "Name")
VALUES ('5', 'https://media.movieofthenight.com/services/disney/logo-dark-theme.svg', 0, 'https://media.movieofthenight.com/services/disney/logo-light-theme.svg', 'Disney+');
SELECT changes();

INSERT INTO "StreamingService" ("ServiceID", "DarkLogo", "IsDeleted", "LightLogo", "Name")
VALUES ('6', 'https://media.movieofthenight.com/services/apple/logo-dark-theme.svg', 0, 'https://media.movieofthenight.com/services/apple/logo-light-theme.svg', 'Apple TV');
SELECT changes();

INSERT INTO "StreamingService" ("ServiceID", "DarkLogo", "IsDeleted", "LightLogo", "Name")
VALUES ('7', 'https://media.movieofthenight.com/services/paramount/logo-dark-theme.svg', 0, 'https://media.movieofthenight.com/services/paramount/logo-light-theme.svg', 'Paramount+');
SELECT changes();

INSERT INTO "StreamingService" ("ServiceID", "DarkLogo", "IsDeleted", "LightLogo", "Name")
VALUES ('8', 'https://media.movieofthenight.com/services/peacock/logo-dark-theme.svg', 0, 'https://media.movieofthenight.com/services/peacock/logo-light-theme.svg', 'Peacock');
SELECT changes();


CREATE INDEX "IX_ContentGenre_GenresGenreID" ON "ContentGenre" ("GenresGenreID");

CREATE INDEX "IX_List_OwnerUserID" ON "List" ("OwnerUserID");

CREATE INDEX "IX_ListContent_ListsListID" ON "ListContent" ("ListsListID");

CREATE INDEX "IX_ListShares_UserID" ON "ListShares" ("UserID");

CREATE INDEX "IX_StreamingOption_ServiceID" ON "StreamingOption" ("ServiceID");

CREATE UNIQUE INDEX "IX_User_Email" ON "User" ("Email");

CREATE INDEX "IX_UserGenre_UsersUserID" ON "UserGenre" ("UsersUserID");

CREATE INDEX "IX_UserService_UsersUserID" ON "UserService" ("UsersUserID");

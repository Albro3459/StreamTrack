-- dotnet ef migrations script > out.txt
CREATE TABLE "ContentPartial" (
    "TMDB_ID" text NOT NULL,
    "Title" text NOT NULL,
    "Overview" text NOT NULL,
    "Rating" double precision NOT NULL,
    "ReleaseYear" integer NOT NULL,
    "IsDeleted" boolean NOT NULL,
    CONSTRAINT "PK_ContentPartial" PRIMARY KEY ("TMDB_ID")
);

CREATE TABLE "Genre" (
    "GenreID" text NOT NULL,
    "Name" text NOT NULL,
    "IsDeleted" boolean NOT NULL,
    CONSTRAINT "PK_Genre" PRIMARY KEY ("GenreID")
);

CREATE TABLE "StreamingService" (
    "ServiceID" text NOT NULL,
    "Name" text NOT NULL,
    "LightLogo" text NOT NULL,
    "DarkLogo" text NOT NULL,
    "IsDeleted" boolean NOT NULL,
    CONSTRAINT "PK_StreamingService" PRIMARY KEY ("ServiceID")
);

CREATE TABLE "User" (
    "UserID" text NOT NULL,
    "Email" text NOT NULL,
    "FirstName" text NOT NULL,
    "LastName" text NOT NULL,
    "IsDeleted" boolean NOT NULL,
    CONSTRAINT "PK_User" PRIMARY KEY ("UserID")
);

CREATE TABLE "ContentDetail" (
    "TMDB_ID" text NOT NULL,
    "IsPopular" boolean NOT NULL,
    "Title" text NOT NULL,
    "Overview" text NOT NULL,
    "ReleaseYear" integer NOT NULL,
    "RapidID" text NOT NULL,
    "IMDB_ID" text NOT NULL,
    "ShowType" text NOT NULL,
    "Cast" text NOT NULL,
    "Directors" text NOT NULL,
    "Rating" double precision NOT NULL,
    "Runtime" integer,
    "SeasonCount" integer,
    "EpisodeCount" integer,
    "TTL_UTC" timestamp with time zone NOT NULL,
    "IsDeleted" boolean NOT NULL,
    CONSTRAINT "PK_ContentDetail" PRIMARY KEY ("TMDB_ID"),
    CONSTRAINT "FK_ContentDetail_ContentPartial_TMDB_ID" FOREIGN KEY ("TMDB_ID") REFERENCES "ContentPartial" ("TMDB_ID") ON DELETE CASCADE
);

CREATE TABLE "Poster" (
    "TMDB_ID" text NOT NULL,
    "VerticalPoster" text NOT NULL,
    "LargeVerticalPoster" text NOT NULL,
    "HorizontalPoster" text NOT NULL,
    CONSTRAINT "PK_Poster" PRIMARY KEY ("TMDB_ID"),
    CONSTRAINT "FK_Poster_ContentPartial_TMDB_ID" FOREIGN KEY ("TMDB_ID") REFERENCES "ContentPartial" ("TMDB_ID") ON DELETE CASCADE
);

CREATE TABLE "List" (
    "ListID" text NOT NULL,
    "OwnerUserID" text NOT NULL,
    "ListName" text NOT NULL,
    "Version" bytea,
    "IsDeleted" boolean NOT NULL,
    CONSTRAINT "PK_List" PRIMARY KEY ("ListID"),
    CONSTRAINT "FK_List_User_OwnerUserID" FOREIGN KEY ("OwnerUserID") REFERENCES "User" ("UserID") ON DELETE CASCADE
);

CREATE TABLE "UserGenre" (
    "GenresGenreID" text NOT NULL,
    "UsersUserID" text NOT NULL,
    CONSTRAINT "PK_UserGenre" PRIMARY KEY ("GenresGenreID", "UsersUserID"),
    CONSTRAINT "FK_UserGenre_Genre_GenresGenreID" FOREIGN KEY ("GenresGenreID") REFERENCES "Genre" ("GenreID") ON DELETE CASCADE,
    CONSTRAINT "FK_UserGenre_User_UsersUserID" FOREIGN KEY ("UsersUserID") REFERENCES "User" ("UserID") ON DELETE CASCADE
);

CREATE TABLE "UserService" (
    "StreamingServicesServiceID" text NOT NULL,
    "UsersUserID" text NOT NULL,
    CONSTRAINT "PK_UserService" PRIMARY KEY ("StreamingServicesServiceID", "UsersUserID"),
    CONSTRAINT "FK_UserService_StreamingService_StreamingServicesServiceID" FOREIGN KEY ("StreamingServicesServiceID") REFERENCES "StreamingService" ("ServiceID") ON DELETE CASCADE,
    CONSTRAINT "FK_UserService_User_UsersUserID" FOREIGN KEY ("UsersUserID") REFERENCES "User" ("UserID") ON DELETE CASCADE
);

CREATE TABLE "ContentGenre" (
    "ContentDetailsTMDB_ID" text NOT NULL,
    "GenresGenreID" text NOT NULL,
    CONSTRAINT "PK_ContentGenre" PRIMARY KEY ("ContentDetailsTMDB_ID", "GenresGenreID"),
    CONSTRAINT "FK_ContentGenre_ContentDetail_ContentDetailsTMDB_ID" FOREIGN KEY ("ContentDetailsTMDB_ID") REFERENCES "ContentDetail" ("TMDB_ID") ON DELETE CASCADE,
    CONSTRAINT "FK_ContentGenre_Genre_GenresGenreID" FOREIGN KEY ("GenresGenreID") REFERENCES "Genre" ("GenreID") ON DELETE CASCADE
);

CREATE TABLE "StreamingOption" (
    "TMDB_ID" text NOT NULL,
    "ServiceID" text NOT NULL,
    "Type" text NOT NULL,
    "Price" text,
    "DeepLink" text NOT NULL,
    CONSTRAINT "PK_StreamingOption" PRIMARY KEY ("TMDB_ID", "ServiceID"),
    CONSTRAINT "FK_StreamingOption_ContentDetail_TMDB_ID" FOREIGN KEY ("TMDB_ID") REFERENCES "ContentDetail" ("TMDB_ID") ON DELETE CASCADE,
    CONSTRAINT "FK_StreamingOption_StreamingService_ServiceID" FOREIGN KEY ("ServiceID") REFERENCES "StreamingService" ("ServiceID") ON DELETE CASCADE
);

CREATE TABLE "ListContent" (
    "ContentPartialsTMDB_ID" text NOT NULL,
    "ListsListID" text NOT NULL,
    CONSTRAINT "PK_ListContent" PRIMARY KEY ("ContentPartialsTMDB_ID", "ListsListID"),
    CONSTRAINT "FK_ListContent_ContentPartial_ContentPartialsTMDB_ID" FOREIGN KEY ("ContentPartialsTMDB_ID") REFERENCES "ContentPartial" ("TMDB_ID") ON DELETE CASCADE,
    CONSTRAINT "FK_ListContent_List_ListsListID" FOREIGN KEY ("ListsListID") REFERENCES "List" ("ListID") ON DELETE CASCADE
);

CREATE TABLE "ListShares" (
    "ListID" text NOT NULL,
    "UserID" text NOT NULL,
    "Permission" text NOT NULL,
    CONSTRAINT "PK_ListShares" PRIMARY KEY ("ListID", "UserID"),
    CONSTRAINT "FK_ListShares_List_ListID" FOREIGN KEY ("ListID") REFERENCES "List" ("ListID") ON DELETE CASCADE,
    CONSTRAINT "FK_ListShares_User_UserID" FOREIGN KEY ("UserID") REFERENCES "User" ("UserID") ON DELETE CASCADE
);

INSERT INTO "Genre" ("GenreID", "IsDeleted", "Name")
VALUES ('1', FALSE, 'Action');
INSERT INTO "Genre" ("GenreID", "IsDeleted", "Name")
VALUES ('2', FALSE, 'Comedy');
INSERT INTO "Genre" ("GenreID", "IsDeleted", "Name")
VALUES ('3', FALSE, 'Documentary');
INSERT INTO "Genre" ("GenreID", "IsDeleted", "Name")
VALUES ('4', FALSE, 'Drama');
INSERT INTO "Genre" ("GenreID", "IsDeleted", "Name")
VALUES ('5', FALSE, 'Horror');
INSERT INTO "Genre" ("GenreID", "IsDeleted", "Name")
VALUES ('6', FALSE, 'Romance');
INSERT INTO "Genre" ("GenreID", "IsDeleted", "Name")
VALUES ('7', FALSE, 'Science Fiction');
INSERT INTO "Genre" ("GenreID", "IsDeleted", "Name")
VALUES ('8', FALSE, 'Thriller');
INSERT INTO "Genre" ("GenreID", "IsDeleted", "Name")
VALUES ('9', FALSE, 'Western');

INSERT INTO "StreamingService" ("ServiceID", "DarkLogo", "IsDeleted", "LightLogo", "Name")
VALUES ('1', 'https://media.movieofthenight.com/services/netflix/logo-dark-theme.svg', FALSE, 'https://media.movieofthenight.com/services/netflix/logo-light-theme.svg', 'Netflix');
INSERT INTO "StreamingService" ("ServiceID", "DarkLogo", "IsDeleted", "LightLogo", "Name")
VALUES ('2', 'https://media.movieofthenight.com/services/hulu/logo-dark-theme.svg', FALSE, 'https://media.movieofthenight.com/services/hulu/logo-light-theme.svg', 'Hulu');
INSERT INTO "StreamingService" ("ServiceID", "DarkLogo", "IsDeleted", "LightLogo", "Name")
VALUES ('3', 'https://media.movieofthenight.com/services/max/logo-dark-theme.svg', FALSE, 'https://media.movieofthenight.com/services/max/logo-light-theme.svg', 'Max');
INSERT INTO "StreamingService" ("ServiceID", "DarkLogo", "IsDeleted", "LightLogo", "Name")
VALUES ('4', 'https://media.movieofthenight.com/services/prime/logo-dark-theme.svg', FALSE, 'https://media.movieofthenight.com/services/prime/logo-light-theme.svg', 'Prime Video');
INSERT INTO "StreamingService" ("ServiceID", "DarkLogo", "IsDeleted", "LightLogo", "Name")
VALUES ('5', 'https://media.movieofthenight.com/services/disney/logo-dark-theme.svg', FALSE, 'https://media.movieofthenight.com/services/disney/logo-light-theme.svg', 'Disney+');
INSERT INTO "StreamingService" ("ServiceID", "DarkLogo", "IsDeleted", "LightLogo", "Name")
VALUES ('6', 'https://media.movieofthenight.com/services/apple/logo-dark-theme.svg', FALSE, 'https://media.movieofthenight.com/services/apple/logo-light-theme.svg', 'Apple TV');
INSERT INTO "StreamingService" ("ServiceID", "DarkLogo", "IsDeleted", "LightLogo", "Name")
VALUES ('7', 'https://media.movieofthenight.com/services/paramount/logo-dark-theme.svg', FALSE, 'https://media.movieofthenight.com/services/paramount/logo-light-theme.svg', 'Paramount+');
INSERT INTO "StreamingService" ("ServiceID", "DarkLogo", "IsDeleted", "LightLogo", "Name")
VALUES ('8', 'https://media.movieofthenight.com/services/peacock/logo-dark-theme.svg', FALSE, 'https://media.movieofthenight.com/services/peacock/logo-light-theme.svg', 'Peacock');

CREATE INDEX "IX_ContentGenre_GenresGenreID" ON "ContentGenre" ("GenresGenreID");

CREATE INDEX "IX_List_OwnerUserID" ON "List" ("OwnerUserID");

CREATE INDEX "IX_ListContent_ListsListID" ON "ListContent" ("ListsListID");

CREATE INDEX "IX_ListShares_UserID" ON "ListShares" ("UserID");

CREATE INDEX "IX_StreamingOption_ServiceID" ON "StreamingOption" ("ServiceID");

CREATE UNIQUE INDEX "IX_User_Email" ON "User" ("Email");

CREATE INDEX "IX_UserGenre_UsersUserID" ON "UserGenre" ("UsersUserID");

CREATE INDEX "IX_UserService_UsersUserID" ON "UserService" ("UsersUserID");

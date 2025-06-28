CREATE TABLE "Content" (
    "TMDB_ID" TEXT NOT NULL CONSTRAINT "PK_Content" PRIMARY KEY,
    "Title" TEXT NOT NULL,
    "Overview" TEXT NOT NULL,
    "ReleaseYear" INTEGER NOT NULL,
    "RapidID" TEXT NOT NULL,
    "IMDB_ID" TEXT NOT NULL,
    "ShowType" TEXT NOT NULL,
    "Cast" TEXT NOT NULL,
    "Directors" TEXT NOT NULL,
    "Rating" INTEGER NOT NULL,
    "Runtime" INTEGER NULL,
    "SeasonCount" INTEGER NULL,
    "EpisodeCount" INTEGER NULL,
    "VerticalPoster" TEXT NOT NULL,
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

CREATE TABLE "ContentGenre" (
    "ContentsTMDB_ID" TEXT NOT NULL,
    "GenresGenreID" TEXT NOT NULL,
    CONSTRAINT "PK_ContentGenre" PRIMARY KEY ("ContentsTMDB_ID", "GenresGenreID"),
    CONSTRAINT "FK_ContentGenre_Content_ContentsTMDB_ID" FOREIGN KEY ("ContentsTMDB_ID") REFERENCES "Content" ("TMDB_ID") ON DELETE CASCADE,
    CONSTRAINT "FK_ContentGenre_Genre_GenresGenreID" FOREIGN KEY ("GenresGenreID") REFERENCES "Genre" ("GenreID") ON DELETE CASCADE
);

CREATE TABLE "StreamingOption" (
    "TMDB_ID" TEXT NOT NULL,
    "ServiceID" TEXT NOT NULL,
    "Type" TEXT NOT NULL,
    "Price" TEXT NULL,
    "DeepLink" TEXT NOT NULL,
    CONSTRAINT "PK_StreamingOption" PRIMARY KEY ("TMDB_ID", "ServiceID"),
    CONSTRAINT "FK_StreamingOption_Content_TMDB_ID" FOREIGN KEY ("TMDB_ID") REFERENCES "Content" ("TMDB_ID") ON DELETE CASCADE,
    CONSTRAINT "FK_StreamingOption_StreamingService_ServiceID" FOREIGN KEY ("ServiceID") REFERENCES "StreamingService" ("ServiceID") ON DELETE CASCADE
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

CREATE TABLE "ListContent" (
    "ContentsTMDB_ID" TEXT NOT NULL,
    "ListsListID" TEXT NOT NULL,
    CONSTRAINT "PK_ListContent" PRIMARY KEY ("ContentsTMDB_ID", "ListsListID"),
    CONSTRAINT "FK_ListContent_Content_ContentsTMDB_ID" FOREIGN KEY ("ContentsTMDB_ID") REFERENCES "Content" ("TMDB_ID") ON DELETE CASCADE,
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


CREATE INDEX "IX_ContentGenre_GenresGenreID" ON "ContentGenre" ("GenresGenreID");

CREATE INDEX "IX_List_OwnerUserID" ON "List" ("OwnerUserID");

CREATE INDEX "IX_ListContent_ListsListID" ON "ListContent" ("ListsListID");

CREATE INDEX "IX_ListShares_UserID" ON "ListShares" ("UserID");

CREATE INDEX "IX_StreamingOption_ServiceID" ON "StreamingOption" ("ServiceID");

CREATE UNIQUE INDEX "IX_User_Email" ON "User" ("Email");

CREATE INDEX "IX_UserGenre_UsersUserID" ON "UserGenre" ("UsersUserID");

CREATE INDEX "IX_UserService_UsersUserID" ON "UserService" ("UsersUserID");
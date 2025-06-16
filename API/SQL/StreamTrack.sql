CREATE TABLE "users" (
  "id" varchar PRIMARY KEY,
  "email" varchar
);

CREATE TABLE "lists" (
  "id" varchar PRIMARY KEY,
  "user_id" varchar NOT NULL,
  "name" varchar
);

CREATE TABLE "list_shares" (
  "list_id" varchar NOT NULL,
  "user_id" varchar NOT NULL,
  PRIMARY KEY ("list_id", "user_id")
  "permission" varchar NOT NULL
);

CREATE TABLE "content" (
  "id" varchar PRIMARY KEY,
  "title" varchar,
  "overview" text,
  "release_year" integer,
  "imdb_id" varchar,
  "tmdb_id" varchar,
  "show_type" varchar,
  "cast" json,
  "directors" json,
  "rating" integer,
  "runtime" integer, // nullable
  "season_count" integer, // nullable
  "episode_count" integer, // nullable
  "vertical_poster" varchar,
  "horizontal_poster" varchar
);

CREATE TABLE "list_content" (
  "list_id" varchar NOT NULL,
  "content_id" varchar NOT NULL,
  "primary" key(list_id,content_id)
);

CREATE TABLE "genre" (
  "id" varchar PRIMARY KEY,
  "name" varchar
);

CREATE TABLE "content_genre" (
  "content_id" varchar NOT NULL,
  "genre_id" varchar NOT NULL,
  "primary" key(content_id,genre_id)
);

CREATE TABLE "user_genre" (
  "user_id" varchar NOT NULL,
  "genre_id" varchar NOT NULL,
  "primary" key(user_id,genre_id)
);

CREATE TABLE "streaming_service" (
  "id" varchar PRIMARY KEY,
  "name" varchar,
  "logo_image" varchar
);

CREATE TABLE "user_service" (
  "user_id" varchar NOT NULL,
  "service_id" varchar NOT NULL,
  "primary" key(user_id,service_id)
);

CREATE TABLE "streaming_option" (
  "content_id" varchar NOT NULL,
  "service_id" varchar NOT NULL,
  "primary" key(content_id,service_id),
  "type" varchar,
  "price" varchar, // nullable
  "deep_link" varchar
);

COMMENT ON COLUMN "content"."runtime" IS 'nullable';

COMMENT ON COLUMN "content"."season_count" IS 'nullable';

COMMENT ON COLUMN "content"."episode_count" IS 'nullable';

COMMENT ON COLUMN "streaming_option"."price" IS 'nullable';

ALTER TABLE "lists" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");

ALTER TABLE "list_shares" ADD FOREIGN KEY ("list_id") REFERENCES "lists" ("id");

ALTER TABLE "list_shares" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");

ALTER TABLE "list_content" ADD FOREIGN KEY ("list_id") REFERENCES "lists" ("id");

ALTER TABLE "list_content" ADD FOREIGN KEY ("content_id") REFERENCES "content" ("id");

ALTER TABLE "content_genre" ADD FOREIGN KEY ("content_id") REFERENCES "content" ("id");

ALTER TABLE "content_genre" ADD FOREIGN KEY ("genre_id") REFERENCES "genre" ("id");

ALTER TABLE "user_genre" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");

ALTER TABLE "user_genre" ADD FOREIGN KEY ("genre_id") REFERENCES "genre" ("id");

ALTER TABLE "user_service" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");

ALTER TABLE "user_service" ADD FOREIGN KEY ("service_id") REFERENCES "streaming_service" ("id");

ALTER TABLE "streaming_option" ADD FOREIGN KEY ("content_id") REFERENCES "content" ("id");

ALTER TABLE "streaming_option" ADD FOREIGN KEY ("service_id") REFERENCES "streaming_service" ("id");

-- BEGIN;

-- DO $$
-- BEGIN
--   IF EXISTS (
--     SELECT 1 FROM "User"
--     WHERE "UserID" = 'uWpHOgCKlWV0EcftosxyeB3KCkR2'
--   ) THEN
--     RAISE EXCEPTION 'Target UserID already exists';
--   END IF;
-- END $$;

-- UPDATE "User"
-- SET "Email" = 'brodsky.alex22@gmail.com.old-q4hC5QHnauRYkvF8QjSTfSZhhqs2'
-- WHERE "UserID" = 'q4hC5QHnauRYkvF8QjSTfSZhhqs2'
--   AND "Email" = 'brodsky.alex22@gmail.com';

-- INSERT INTO "User" ("UserID", "Email", "FirstName", "LastName", "IsDeleted")
-- SELECT
--   'uWpHOgCKlWV0EcftosxyeB3KCkR2',
--   'brodsky.alex22@gmail.com',
--   "FirstName",
--   "LastName",
--   "IsDeleted"
-- FROM "User"
-- WHERE "UserID" = 'q4hC5QHnauRYkvF8QjSTfSZhhqs2';

-- INSERT INTO "UserGenre" ("GenresGenreID", "UsersUserID")
-- SELECT "GenresGenreID", 'uWpHOgCKlWV0EcftosxyeB3KCkR2'
-- FROM "UserGenre"
-- WHERE "UsersUserID" = 'q4hC5QHnauRYkvF8QjSTfSZhhqs2'
-- ON CONFLICT DO NOTHING;

-- DELETE FROM "UserGenre"
-- WHERE "UsersUserID" = 'q4hC5QHnauRYkvF8QjSTfSZhhqs2';

-- INSERT INTO "UserService" ("StreamingServicesServiceID", "UsersUserID")
-- SELECT "StreamingServicesServiceID", 'uWpHOgCKlWV0EcftosxyeB3KCkR2'
-- FROM "UserService"
-- WHERE "UsersUserID" = 'q4hC5QHnauRYkvF8QjSTfSZhhqs2'
-- ON CONFLICT DO NOTHING;

-- DELETE FROM "UserService"
-- WHERE "UsersUserID" = 'q4hC5QHnauRYkvF8QjSTfSZhhqs2';

-- UPDATE "List"
-- SET "OwnerUserID" = 'uWpHOgCKlWV0EcftosxyeB3KCkR2'
-- WHERE "OwnerUserID" = 'q4hC5QHnauRYkvF8QjSTfSZhhqs2';

-- INSERT INTO "ListShares" ("ListID", "UserID", "Permission")
-- SELECT "ListID", 'uWpHOgCKlWV0EcftosxyeB3KCkR2', "Permission"
-- FROM "ListShares"
-- WHERE "UserID" = 'q4hC5QHnauRYkvF8QjSTfSZhhqs2'
-- ON CONFLICT DO NOTHING;

-- DELETE FROM "ListShares"
-- WHERE "UserID" = 'q4hC5QHnauRYkvF8QjSTfSZhhqs2';

-- DELETE FROM "User"
-- WHERE "UserID" = 'q4hC5QHnauRYkvF8QjSTfSZhhqs2';

-- -- Select to verify before COMMIT or ROLLBACK:
-- SELECT * FROM "User"
-- WHERE "UserID" = 'q4hC5QHnauRYkvF8QjSTfSZhhqs2';

-- SELECT g.*
-- FROM "UserGenre" ug
-- JOIN "Genre" g ON g."GenreID" = ug."GenresGenreID"
-- WHERE ug."UsersUserID" = 'q4hC5QHnauRYkvF8QjSTfSZhhqs2';

-- SELECT s.*
-- FROM "UserService" us
-- JOIN "StreamingService" s ON s."ServiceID" = us."StreamingServicesServiceID"
-- WHERE us."UsersUserID" = 'q4hC5QHnauRYkvF8QjSTfSZhhqs2';

-- SELECT *
-- FROM "List"
-- WHERE "OwnerUserID" = 'q4hC5QHnauRYkvF8QjSTfSZhhqs2';

-- SELECT *
-- FROM "ListShares"
-- WHERE "UserID" = 'q4hC5QHnauRYkvF8QjSTfSZhhqs2';

-- -- COMMIT; or ROLLBACK;
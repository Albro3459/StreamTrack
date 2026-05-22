-- BEGIN;

-- DO $$
-- BEGIN
--   IF EXISTS (
--     SELECT 1 FROM "User"
--     WHERE "UserID" = 'XAce7lCayYTf1LezN2WqFvIq6Kp2'
--   ) THEN
--     RAISE EXCEPTION 'Target UserID already exists';
--   END IF;
-- END $$;

-- UPDATE "User"
-- SET "Email" = 'brodsky.alex22@gmail.com.old-uWpHOgCKlWV0EcftosxyeB3KCkR2'
-- WHERE "UserID" = 'uWpHOgCKlWV0EcftosxyeB3KCkR2'
--   AND "Email" = 'brodsky.alex22@gmail.com';

-- INSERT INTO "User" ("UserID", "Email", "FirstName", "LastName", "IsDeleted")
-- SELECT
--   'XAce7lCayYTf1LezN2WqFvIq6Kp2',
--   'brodsky.alex22@gmail.com',
--   "FirstName",
--   "LastName",
--   "IsDeleted"
-- FROM "User"
-- WHERE "UserID" = 'uWpHOgCKlWV0EcftosxyeB3KCkR2';

-- INSERT INTO "UserGenre" ("GenresGenreID", "UsersUserID")
-- SELECT "GenresGenreID", 'XAce7lCayYTf1LezN2WqFvIq6Kp2'
-- FROM "UserGenre"
-- WHERE "UsersUserID" = 'uWpHOgCKlWV0EcftosxyeB3KCkR2'
-- ON CONFLICT DO NOTHING;

-- DELETE FROM "UserGenre"
-- WHERE "UsersUserID" = 'uWpHOgCKlWV0EcftosxyeB3KCkR2';

-- INSERT INTO "UserService" ("StreamingServicesServiceID", "UsersUserID")
-- SELECT "StreamingServicesServiceID", 'XAce7lCayYTf1LezN2WqFvIq6Kp2'
-- FROM "UserService"
-- WHERE "UsersUserID" = 'uWpHOgCKlWV0EcftosxyeB3KCkR2'
-- ON CONFLICT DO NOTHING;

-- DELETE FROM "UserService"
-- WHERE "UsersUserID" = 'uWpHOgCKlWV0EcftosxyeB3KCkR2';

-- UPDATE "List"
-- SET "OwnerUserID" = 'XAce7lCayYTf1LezN2WqFvIq6Kp2'
-- WHERE "OwnerUserID" = 'uWpHOgCKlWV0EcftosxyeB3KCkR2';

-- INSERT INTO "ListShares" ("ListID", "UserID", "Permission")
-- SELECT "ListID", 'XAce7lCayYTf1LezN2WqFvIq6Kp2', "Permission"
-- FROM "ListShares"
-- WHERE "UserID" = 'uWpHOgCKlWV0EcftosxyeB3KCkR2'
-- ON CONFLICT DO NOTHING;

-- DELETE FROM "ListShares"
-- WHERE "UserID" = 'uWpHOgCKlWV0EcftosxyeB3KCkR2';

-- DELETE FROM "User"
-- WHERE "UserID" = 'uWpHOgCKlWV0EcftosxyeB3KCkR2';

-- -- Select to verify before COMMIT or ROLLBACK:
-- -- SHOULD ALL BE EMPTY!!
-- SELECT * FROM "User"
-- WHERE "UserID" = 'uWpHOgCKlWV0EcftosxyeB3KCkR2';

-- SELECT g.*
-- FROM "UserGenre" ug
-- JOIN "Genre" g ON g."GenreID" = ug."GenresGenreID"
-- WHERE ug."UsersUserID" = 'uWpHOgCKlWV0EcftosxyeB3KCkR2';

-- SELECT s.*
-- FROM "UserService" us
-- JOIN "StreamingService" s ON s."ServiceID" = us."StreamingServicesServiceID"
-- WHERE us."UsersUserID" = 'uWpHOgCKlWV0EcftosxyeB3KCkR2';

-- SELECT *
-- FROM "List"
-- WHERE "OwnerUserID" = 'uWpHOgCKlWV0EcftosxyeB3KCkR2';

-- SELECT *
-- FROM "ListShares"
-- WHERE "UserID" = 'uWpHOgCKlWV0EcftosxyeB3KCkR2';

-- -- COMMIT; or ROLLBACK;
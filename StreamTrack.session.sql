select * from User;

select * from List;

select * from ListContent where ListsListID = "188c9ee0-88a2-4116-a1bd-8fc3a43f0adc";

select * from Content;

select * from Genre;

select * from StreamingService;


SELECT 
    u.UserID,
    u.FirstName,
    u.LastName,
    g.GenreID,
    g.Name AS GenreName
FROM User u
JOIN UserGenre ug ON u.UserID = ug.UsersUserID
JOIN Genre g ON ug.GenresGenreID = g.GenreID
ORDER BY u.UserID, g.Name;


SELECT 
    u.UserID,
    u.FirstName,
    u.LastName,
    s.ServiceID,
    s.Name AS ServiceName
FROM User u
JOIN UserService us ON u.UserID = us.UsersUserID
JOIN StreamingService s ON us.StreamingServicesServiceID = s.ServiceID
ORDER BY u.UserID, s.Name;

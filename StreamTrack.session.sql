select * from User;

select * from List;

select * from ListContent;

select * from Content;
select * from Content where VerticalPoster LIKE '%www%' OR HorizontalPoster LIKE '%www%';

select * from Genre;

select * from StreamingService;

select * from StreamingOption;


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

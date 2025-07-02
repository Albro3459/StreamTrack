select * from User;

select * from List;

select * from ListContent;

select * from ContentDetail;
select * from ContentDetail where VerticalPoster LIKE 'https://www%' OR HorizontalPoster LIKE 'https://www%';
select * from ContentDetail where VerticalPoster LIKE '%svg%' OR HorizontalPoster LIKE '%svg%';


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

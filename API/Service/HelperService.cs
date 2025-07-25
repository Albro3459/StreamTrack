using API.DTOs;
using API.Infrastructure;
using API.Models;
using AutoMapper;
using Microsoft.EntityFrameworkCore;

namespace API.Service;

public class HelperService {

    private readonly StreamTrackDbContext context;
    private readonly IMapper mapper;

    private static readonly Random rng = new Random();

    public HelperService(StreamTrackDbContext _context, IMapper _mapper) {
        context = _context;
        mapper = _mapper;
    }

    public async Task<List<ContentPartialDTO>> GetRecommendations(ContentDetail detail, int maxRecommended) {
        var genreNames = detail.Genres.Select(g => g.Name.ToLower()).ToList();
        var streamingServiceNames = detail.StreamingOptions.Select(s => s.StreamingService.Name.ToLower()).ToList();

        List<ContentDetail> matches = await context.ContentDetail
            .Include(c => c.Genres)
            .Include(c => c.StreamingOptions)
                .ThenInclude(s => s.StreamingService)
            .Where(c => c.TMDB_ID != detail.TMDB_ID && (
                c.Genres.Any(g => genreNames.Contains(g.Name.ToLower())) ||
                c.StreamingOptions.Any(s => streamingServiceNames.Contains(s.StreamingService.Name.ToLower()))
            ))
            .OrderByDescending(c =>
                // Weight: shared genres + shared streaming services
                c.Genres.Count(g => genreNames.Contains(g.Name.ToLower())) +
                c.StreamingOptions.Count(s => streamingServiceNames.Contains(s.StreamingService.Name.ToLower()))
            )
            .Take(maxRecommended * 2)
            .ToListAsync();

        return matches
            .OrderBy(_ => rng.Next())
            .Take(maxRecommended)
            .Select(c => mapper.Map<ContentDetail, ContentPartialDTO>(c))
            .ToList();
    }

    public async Task<User?> GetFullUserByID(string userID) {
        return await context.User
            .Include(u => u.ListsOwned)
                .ThenInclude(l => l.ContentPartials)
                    .ThenInclude(p => p.Detail)
                        .ThenInclude(d => d.Genres)
            .Include(u => u.ListsOwned)
                .ThenInclude(l => l.ContentPartials)
                    .ThenInclude(p => p.Detail)
                        .ThenInclude(d => d.StreamingOptions)
                            .ThenInclude(s => s.StreamingService)
            .Include(u => u.ListShares)
                .ThenInclude(ls => ls.List)
                    .ThenInclude(l => l.ContentPartials)
                        .ThenInclude(p => p.Detail)
                            .ThenInclude(d => d.Genres)
            .Include(u => u.ListShares)
                .ThenInclude(ls => ls.List)
                    .ThenInclude(l => l.ContentPartials)
                        .ThenInclude(p => p.Detail)
                            .ThenInclude(d => d.StreamingOptions)
                                .ThenInclude(s => s.StreamingService)
            .Include(u => u.Genres)
            .Include(u => u.StreamingServices)
            .FirstOrDefaultAsync(u => u.UserID == userID);
    }


    public async Task<List<List>> GetFullListsOwnedByUserID(string userID) {
        return await context.List
                    .Include(l => l.Owner)
                    .Include(l => l.ContentPartials)
                        .ThenInclude(p => p.Detail)
                            .ThenInclude(d => d.Genres)
                    .Include(l => l.ContentPartials)
                        .ThenInclude(p => p.Detail)
                            .ThenInclude(p => p.StreamingOptions)
                                .ThenInclude(s => s.StreamingService)
                    .Include(l => l.ListShares)
                    .Where(l => l.OwnerUserID.Equals(userID))
                    .ToListAsync();
    }

    // Only used by GetUserLists which is only used for Swagger checking
    public async Task<UserDataDTO> MapUserToFullUserDTO(User user) {
        UserDataDTO userDataDTO = mapper.Map<User, UserDataDTO>(user);

        userDataDTO.ListsOwned.ForEach(l => l.IsOwner = true);

        List<List> listsSharedWithMe = await GetListsSharedToUser(user.UserID);
        userDataDTO.ListsSharedWithMe = mapper.Map<List<List>, List<ListDTO>>(listsSharedWithMe);
        userDataDTO.ListsSharedWithMe.ForEach(l => l.IsOwner = false);

        List<List> listSharedWithOthers = await GetListsSharedByAndOwnedByUser(user.UserID);
        userDataDTO.ListsSharedWithOthers = mapper.Map<List<List>, List<ListDTO>>(listSharedWithOthers);
        userDataDTO.ListsSharedWithOthers.ForEach(l => l.IsOwner = true);

        return userDataDTO;
    }

    public async Task<UserMinimalDataDTO> MapUserToMinimalDTO(User user) {
        UserMinimalDataDTO minimalDTO = mapper.Map<User, UserMinimalDataDTO>(user);

        minimalDTO.ListsOwned.ForEach(l => l.IsOwner = true);

        var listsSharedWithMe = await GetListsSharedToUser(user.UserID);
        minimalDTO.ListsSharedWithMe = mapper.Map<List<List>, List<ListMinimalDTO>>(listsSharedWithMe);
        minimalDTO.ListsSharedWithMe.ForEach(l => l.IsOwner = false);

        var listsSharedWithOthers = await GetListsSharedByAndOwnedByUser(user.UserID);
        minimalDTO.ListsSharedWithOthers = mapper.Map<List<List>, List<ListMinimalDTO>>(listsSharedWithOthers);
        minimalDTO.ListsSharedWithOthers.ForEach(l => l.IsOwner = true);

        return minimalDTO;
    }

    public List<ContentPartialDTO> GetUsersContentMinimalDTOs(User user) {

        HashSet<ContentPartialDTO> set = new();

        user.ListsOwned.ToList().ForEach(l => mapper.Map<ICollection<ContentPartial>, List<ContentPartialDTO>>(l.ContentPartials).ForEach(c => set.Add(c)));

        var listsSharedWithMe = GetListsSharedToUser(user);
        listsSharedWithMe.ForEach(l => mapper.Map<ICollection<ContentPartial>, List<ContentPartialDTO>>(l.ContentPartials).ForEach(c => set.Add(c)));

        var listsSharedWithOthers = GetListsSharedByAndOwnedByUser(user);
        listsSharedWithOthers.ForEach(l => mapper.Map<ICollection<ContentPartial>, List<ContentPartialDTO>>(l.ContentPartials).ForEach(c => set.Add(c)));

        return set.ToList();
    }

    public async Task<List<List>> GetListsSharedToUser(string userID) {
        List<List> lists = await context.ListShares
                            .Include(ls => ls.List)
                                .ThenInclude(l => l.ContentPartials)
                            .Where(ls => ls.UserID == userID)
                            .Select(ls => ls.List)
                            .Distinct()
                            .ToListAsync();

        return lists;

    }
    public List<List> GetListsSharedToUser(User user) {
        List<List> lists = user.ListShares
                            .Select(ls => ls.List)
                            .Distinct()
                            .ToList();

        return lists;

    }

    public async Task<List<List>> GetListsSharedByAndOwnedByUser(string userID) {
        List<List> lists = await context.ListShares
                            .Include(ls => ls.List)
                                .ThenInclude(l => l.ContentPartials)
                            .Where(ls => ls.List.OwnerUserID == userID)
                            .Select(ls => ls.List)
                            .Distinct()
                            .ToListAsync();

        return lists;
    }
    public List<List> GetListsSharedByAndOwnedByUser(User user) {
        List<List> lists = user.ListShares
                            .Select(ls => ls.List)
                            .Distinct()
                            .ToList();

        return lists;
    }

    // Used by the bulk update controller
    // DOES NOT SAVE intentionally
    public async Task<ContentDetail?> ContentDTOToContent(ContentDTO dto) {

        var content = new ContentDetail { // leaving out Genres, StreamingOptions, and Lists
            TMDB_ID = dto.TMDB_ID,
            Title = dto.Title,
            Overview = dto.Overview,
            ReleaseYear = dto.ReleaseYear,
            RapidID = dto.RapidID,
            IMDB_ID = dto.IMDB_ID,
            ShowType = dto.ShowType,
            Cast = dto.Cast,
            Directors = dto.Directors,
            Rating = dto.Rating,
            Runtime = dto.Runtime,
            SeasonCount = dto.SeasonCount,
            EpisodeCount = dto.EpisodeCount,
            VerticalPoster = dto.VerticalPoster,
            LargeVerticalPoster = dto.LargeVerticalPoster,
            HorizontalPoster = dto.HorizontalPoster
        };

        // Can't do this with Postgres because of concurrency issues
        // var genreTasks = dto.Genres.Select(g => GenreDTOToGenre(g)).ToList();
        // content.Genres = (await Task.WhenAll(genreTasks)).ToList();

        var genres = new List<Genre>();
        foreach (var g in dto.Genres) {
            genres.Add(await GenreDTOToGenre(g));
        }
        content.Genres = genres;


        context.ContentDetail.Add(content);

        // Can't do this with Postgres because of concurrency issues
        // var streamingOptionTasks = dto.StreamingOptions.Select(s => StreamingOptionDTOToStreamingOption(s, content)).ToList();
        // var streamingOptions = await Task.WhenAll(streamingOptionTasks);
        // if (streamingOptions.Any(s => s == null)) {
        //     return null;
        // }
        // content.StreamingOptions = streamingOptions
        //                             .Where(s => s != null)
        //                             .Cast<StreamingOption>()
        //                             .ToList();

        var streamingOptions = new List<StreamingOption>();
        foreach (var s in dto.StreamingOptions) {
            var streamingOption = await StreamingOptionDTOToStreamingOption(s, content);
            if (streamingOption != null) {
                streamingOptions.Add(streamingOption);
            }
        }
        content.StreamingOptions = streamingOptions;

        return content;
    }

    public async Task<Genre> GenreDTOToGenre(GenreDTO dto) {
        // Check db
        Genre? genre = await context.Genre.FirstOrDefaultAsync(g => g.Name == dto.Name);
        if (genre != null) {
            return genre;
        }

        // Check if it was already added in the LOCAL context (Local is in this current transaction in RAM, not the DB). This is a pretty big optimization.
        genre = context.Genre.Local.FirstOrDefault(g => g.Name == dto.Name);
        if (genre != null) {
            return genre;
        }

        genre = new Genre(dto.Name);
        context.Genre.Add(genre);

        return genre;
    }

    public async Task<StreamingOption?> StreamingOptionDTOToStreamingOption(StreamingOptionDTO dto, ContentDetail content) {
        StreamingOption? streamingOption = await context.StreamingOption.FirstOrDefaultAsync(s => s.TMDB_ID == content.TMDB_ID && s.StreamingService.Name == dto.StreamingService.Name);
        if (streamingOption != null) return streamingOption;

        // Check if it was already added in the LOCAL context (Local is in this current transaction in RAM, not the DB). This is a pretty big optimization.
        streamingOption = context.StreamingOption.Local.FirstOrDefault(s => s.TMDB_ID == content.TMDB_ID && s.StreamingService.Name == dto.StreamingService.Name);
        if (streamingOption != null) { return streamingOption; }

        StreamingService service = await StreamingServiceDTOToStreamingService(dto.StreamingService);

        streamingOption = new StreamingOption(content, service, dto.Type, dto.Price, dto.DeepLink);

        context.StreamingOption.Add(streamingOption);

        return streamingOption;

    }

    public async Task<StreamingService> StreamingServiceDTOToStreamingService(StreamingServiceDTO dto) {
        StreamingService? service = await context.StreamingService.FirstOrDefaultAsync(s => s.Name == dto.Name);
        if (service != null) { return service; }

        // Local check
        service = context.StreamingService.Local.FirstOrDefault(s => s.Name == dto.Name);
        if (service != null) { return service; }

        service = new StreamingService(dto.Name, dto.LightLogo, dto.DarkLogo);
        context.StreamingService.Add(service);

        return service;
    }

}
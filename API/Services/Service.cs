using System.Reflection.Metadata.Ecma335;
using System.Threading.Tasks;
using API.DTOs;
using API.Infrastructure;
using API.Models;
using AutoMapper;
using Microsoft.EntityFrameworkCore;

namespace API.Services;

public class Service {

    private readonly StreamTrackDbContext context;
    private readonly IMapper mapper;

    public Service(StreamTrackDbContext _context, IMapper _mapper) {
        context = _context;
        mapper = _mapper;
    }

    public async Task<User?> GetFullUserByID(string userID) {
        return await context.User
                .Include(u => u.ListsOwned)
                    .ThenInclude(l => l.Contents)
                        .ThenInclude(c => c.Genres)
                    .ThenInclude(l => l.Contents)
                        .ThenInclude(c => c.StreamingOptions)
                            .ThenInclude(s => s.StreamingService)
                .Include(u => u.ListShares)
                    .ThenInclude(ls => ls.List)
                        .ThenInclude(l => l.Contents)
                            .ThenInclude(c => c.Genres)
                        .ThenInclude(l => l.Contents)
                            .ThenInclude(c => c.StreamingOptions)
                                .ThenInclude(s => s.StreamingService)
                .Include(u => u.Genres)
                .Include(u => u.StreamingServices)
                .FirstOrDefaultAsync(u => u.UserID.Equals(userID));
    }

    public async Task<List<List>> GetFullListsOwnedByUserID(string userID) {
        return await context.List
                    .Include(l => l.Owner)
                    .Include(l => l.Contents)
                        .ThenInclude(c => c.Genres)
                    .Include(l => l.Contents)
                        .ThenInclude(c => c.StreamingOptions)
                            .ThenInclude(s => s.StreamingService)
                    .Include(l => l.ListShares)
                    .Where(l => l.OwnerUserID.Equals(userID))
                    .ToListAsync();
    }

    public async Task<UserDataDTO> MapUserToUserDTO(User user) {
        UserDataDTO userDataDTO = mapper.Map<User, UserDataDTO>(user);

        userDataDTO.ListsOwned.ForEach(l => l.IsOwner = true);

        List<List> listsSharedWithMe = await GetListsSharedToUser(user.UserID);
        userDataDTO.ListsSharedWithMe = mapper.Map<List<List>, List<ListDTO>>(listsSharedWithMe);

        List<List> listSharedWithOthers = await GetListsSharedByAndOwnedByUser(user.UserID);
        userDataDTO.ListsSharedWithOthers = mapper.Map<List<List>, List<ListDTO>>(listSharedWithOthers);
        userDataDTO.ListsSharedWithOthers.ForEach(l => l.IsOwner = true);

        return userDataDTO;
    }

    public async Task<List<List>> GetListsSharedToUser(string userID) {
        List<List> lists = await context.ListShares
                            .Include(ls => ls.List)
                                .ThenInclude(l => l.Contents)
                            .Where(ls => ls.UserID == userID)
                            .Select(ls => ls.List)
                            .Distinct()
                            .ToListAsync();

        return lists;

    }

    public async Task<List<List>> GetListsSharedByAndOwnedByUser(string userID) {
        List<List> lists = await context.ListShares
                            .Include(ls => ls.List)
                                .ThenInclude(l => l.Contents)
                            .Where(ls => ls.List.OwnerUserID == userID)
                            .Select(ls => ls.List)
                            .Distinct()
                            .ToListAsync();

        return lists;
    }

    public async Task<Content?> ContentDTOToContent(ContentDTO dto) {

        var content = new Content { // leaving out Genres, StreamingOptions, and Lists
            ContentID = dto.ContentID,
            Title = dto.Title,
            Overview = dto.Overview,
            ReleaseYear = dto.ReleaseYear,
            IMDB_ID = dto.IMDB_ID,
            TMDB_ID = dto.TMDB_ID,
            ShowType = dto.ShowType,
            Cast = dto.Cast,
            Directors = dto.Directors,
            Rating = dto.Rating,
            Runtime = dto.Runtime,
            SeasonCount = dto.SeasonCount,
            EpisodeCount = dto.EpisodeCount,
            VerticalPoster = dto.VerticalPoster,
            HorizontalPoster = dto.HorizontalPoster
        };

        var genreTasks = dto.Genres.Select(g => GenreDTOToGenre(g)).ToList();
        content.Genres = (await Task.WhenAll(genreTasks)).ToList();

        await context.Content.AddAsync(content);
        await context.SaveChangesAsync();

        var streamingOptionTasks = dto.StreamingOptions.Select(s => StreamingOptionDTOToStreamingOption(s, dto.ContentID)).ToList();
        var streamingOptions = await Task.WhenAll(streamingOptionTasks);
        if (streamingOptions.Any(s => s == null)) {
            return null;
        }
        content.StreamingOptions = streamingOptions
                                    .Where(s => s != null)
                                    .Cast<StreamingOption>()
                                    .ToList();

        await context.SaveChangesAsync();

        // Skip Lists now because this is being called by the AddToUserList in ListController

        return content;
    }

    public async Task<Genre> GenreDTOToGenre(GenreDTO dto) {
        Genre? genre = await context.Genre.Where(g => g.Name == dto.Name).FirstOrDefaultAsync();
        if (genre != null) {
            return genre;
        }

        genre = new Genre(dto.Name);
        await context.Genre.AddAsync(genre);
        await context.SaveChangesAsync();

        return genre;
    }

    public async Task<StreamingOption?> StreamingOptionDTOToStreamingOption(StreamingOptionDTO dto, string? contentID) {
        StreamingOption? streamingOption = await context.StreamingOption.Where(s => (
            s.ContentID == contentID &&
            s.StreamingService.Name == dto.StreamingService.Name
        )).FirstOrDefaultAsync();
        if (streamingOption != null) return streamingOption;

        Content? content = await context.Content.Where(c => c.ContentID == contentID).FirstOrDefaultAsync();
        if (content == null) return null;

        StreamingService service = await StreamingServiceDTOToStreamingService(dto.StreamingService);

        streamingOption = new StreamingOption(content, service, dto.Type, dto.Price, dto.DeepLink);

        await context.StreamingOption.AddAsync(streamingOption);
        await context.SaveChangesAsync();

        return streamingOption;

    }

    public async Task<StreamingService> StreamingServiceDTOToStreamingService(StreamingServiceDTO dto) {
        StreamingService? service = await context.StreamingService
            .FirstOrDefaultAsync(s => s.Name == dto.Name);

        if (service != null) {
            return service;
        }

        service = new StreamingService(dto.Name, dto.Logo);
        await context.StreamingService.AddAsync(service);
        await context.SaveChangesAsync();

        return service;
    }

}
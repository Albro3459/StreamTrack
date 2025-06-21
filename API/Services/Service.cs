using System.Threading.Tasks;
using API.DTOs;
using API.Infrastructure;
using API.Models;
using Microsoft.EntityFrameworkCore;

namespace API.Services;

public class Service {

    private readonly StreamTrackDbContext context;
    public Service(StreamTrackDbContext _context) {
        context = _context;
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

        var streamingOptionTasks = dto.StreamingOptions.Select(s => StreamingOptionDTOToStreamingOption(s)).ToList();
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

    public async Task<StreamingOption?> StreamingOptionDTOToStreamingOption(StreamingOptionDTO dto) {
        StreamingOption? streamingOption = await context.StreamingOption.Where(s => (
            s.ContentID == dto.Content.ContentID &&
            s.StreamingService.Name == dto.StreamingService.Name
        )).FirstOrDefaultAsync();
        if (streamingOption != null) return streamingOption;

        Content? content = await context.Content.Where(c => c.ContentID == dto.Content.ContentID).FirstOrDefaultAsync();
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
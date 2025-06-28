using System.Text.Json;
using API.DTOs;
using API.Infrastructure;
using API.Models;
using AutoMapper;
using Microsoft.EntityFrameworkCore;

namespace API.Services;

public class RapidAPIService {

    private readonly StreamTrackDbContext context;
    private readonly HttpClient httpClient;
    private readonly IMapper mapper;
    private readonly string apiKey = RAPID_API.KEY;
    private const string RapidAPI_Base_Url = "https://streaming-availability.p.rapidapi.com/shows/";
    private const string RapidAPI_Ending = "?series_granularity=show&output_language=en&country=us";
    private const string RapidApiKeyHeader = "x-rapidapi-key";
    private const string RapidApiHostHeader = "x-rapidapi-host";
    private const string RapidApiHostValue = "streaming-availability.p.rapidapi.com";

    public RapidAPIService(StreamTrackDbContext _context, HttpClient _httpClient, IMapper _mapper) {
        context = _context;
        httpClient = _httpClient;
        mapper = _mapper;
    }

    // Does save because its ran in the background 
    public async Task FetchAndSaveMissingContent(ContentPartialDTO partialDTO) {
        try {
            ContentPartial? partial = await context.ContentPartial
                                                .Include(c => c.Detail)
                                                .Where(c => c.TMDB_ID == partialDTO.TMDB_ID &&
                                                            c.Detail == null
                                                ).FirstOrDefaultAsync();

            if (partial != null) {
                partial.Detail = await FetchContentDetailsByTMDBIDAsync(partialDTO);
                if (partial.Detail != null) {
                    context.ContentDetail.Add(partial.Detail);
                    await context.SaveChangesAsync();
                }
            }
        }
        catch (Exception ex) {
            System.Console.WriteLine("Error in background content fetch (probably on save): " + ex);
        }
    }

    // DOES NOT SAVE! It is up to the called to handle that.
    public async Task<ContentDetail?> FetchContentDetailsByTMDBIDAsync(ContentPartialDTO contentDTO) {
        string url = $"{RapidAPI_Base_Url}{contentDTO.TMDB_ID}{RapidAPI_Ending}";

        using var request = new HttpRequestMessage(HttpMethod.Get, url);
        request.Headers.Add(RapidApiKeyHeader, apiKey);
        request.Headers.Add(RapidApiHostHeader, RapidApiHostValue);

        using var response = await httpClient.SendAsync(request);
        response.EnsureSuccessStatusCode();
        string? json = await response.Content.ReadAsStringAsync();

        APIContent? apiContent = JsonSerializer.Deserialize<APIContent>(json, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
        if (apiContent == null) return null;

        return MapToContentDetail(apiContent, contentDTO.VerticalPoster, contentDTO.HorizontalPoster);
    }

    private ContentDetail MapToContentDetail(APIContent content, string verticalPoster, string horizontalPoster) {
        var details = new ContentDetail {
            TMDB_ID = content.tmdbId,
            Title = content.title,
            Overview = content.overview,
            ReleaseYear = content.releaseYear,
            RapidID = content.id,
            IMDB_ID = content.imdbId,
            ShowType = content.showType.ToString().ToLowerInvariant(),
            Genres = content.genres.Select(g => new Genre { GenreID = g.id, Name = g.name }).ToList(),
            Cast = content.cast,
            Directors = content.directors,
            Rating = content.rating,
            Runtime = content.runtime,
            SeasonCount = content.seasonCount,
            EpisodeCount = content.episodeCount,
            VerticalPoster = verticalPoster,
            HorizontalPoster = horizontalPoster,
        };

        details.StreamingOptions = content.streamingOptions.TryGetValue("us", out List<APIStreamingOption>? options)
                                                                ? options.Select(o => MapToStreamingOption(o, details)).ToList()
                                                                : new List<StreamingOption>();

        return details;
    }

    private StreamingOption MapToStreamingOption(APIStreamingOption option, ContentDetail contentDetail) {
        // Find or create the StreamingService
        var serviceId = option.service.id;
        var service = context.StreamingService.FirstOrDefault(s => s.ServiceID == serviceId);
        if (service == null) {
            service = new StreamingService {
                ServiceID = serviceId,
                Name = option.service.name,
                LightLogo = option.service.imageSet.lightThemeImage,
                DarkLogo = option.service.imageSet.darkThemeImage,
            };
            context.StreamingService.Add(service);
        }

        return new StreamingOption {
            ContentDetails = contentDetail,
            TMDB_ID = contentDetail.TMDB_ID,
            ServiceID = service.ServiceID,
            StreamingService = service,
            Type = option.type.ToString().ToLowerInvariant(),
            Price = option.price?.amount,
            DeepLink = option.link,
        };
    }
}

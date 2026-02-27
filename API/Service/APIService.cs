using Microsoft.EntityFrameworkCore;
using System.Text.Json;

using API.DTOs;
using API.Infrastructure;
using API.Models;
using AutoMapper;
using System.Net.Http.Headers;
using API.Helpers;

namespace API.Service;

class Posters {
    public string VerticalPoster { get; set; } = string.Empty;
    public string LargeVerticalPoster { get; set; } = string.Empty;
    public string HorizontalPoster { get; set; } = string.Empty;
}

public class APIService {

    private readonly StreamTrackDbContext context;
    private readonly HttpClient httpClient;
    private readonly PosterService posterService;
    private readonly IMapper mapper;
    private const string RapidAPI_Base_Url = "https://streaming-availability.p.rapidapi.com/shows/";
    private const string RapidAPI_Ending = "?series_granularity=show&output_language=en&country=us";
    private const string RapidApiKeyHeader = "x-rapidapi-key";
    private const string RapidApiHostHeader = "x-rapidapi-host";
    private const string RapidApiHostValue = "streaming-availability.p.rapidapi.com";

    private const string TMDB_Search_Url = "https://api.themoviedb.org/3/search/multi?query=";
    private const string TMDB_Search_Ending = "&include_adult=false&language=en-US&page=1";
    private const string TMDB_Poster_Url = "https://api.themoviedb.org/3/";
    private const string TMDB_Poster_Ending = "?language=en-US";

    public APIService(StreamTrackDbContext _context, HttpClient _httpClient, PosterService _posterService, IMapper _mapper) {
        context = _context;
        httpClient = _httpClient;
        posterService = _posterService;
        mapper = _mapper;
    }

    // Does save because its ran in the background 
    public async Task FetchAndSaveMissingContent(ContentPartialDTO partialDTO) {
        try {
            ContentPartial? partial = await context.ContentPartial
                                                .Include(c => c.Detail)
                                                .Include(c => c.Poster)
                                                .Where(c => c.TMDB_ID == partialDTO.TMDB_ID &&
                                                            c.Detail == null
                                                ).FirstOrDefaultAsync();

            if (partial != null) {
                var request = mapper.Map<ContentPartialDTO, ContentRequestDTO>(partialDTO);
                partial.Detail = await FetchContentDetailsByTMDBIDAsync(request);
                if (partial.Detail != null) {
                    await posterService.UpsertPoster(partial.TMDB_ID, request.VerticalPoster, request.LargeVerticalPoster, request.HorizontalPoster);
                    context.ContentDetail.Add(partial.Detail);
                    await context.SaveChangesAsync();
                }
            }
        }
        catch (Exception ex) {
            ConsoleLogger.Error("Error in background content fetch (probably on save): " + ex);
        }
    }

    // DOES NOT SAVE! It is up to the caller to handle that.
    public async Task<ContentDetail?> FetchContentDetailsByTMDBIDAsync(ContentRequestDTO contentDTO) {
        string url = $"{RapidAPI_Base_Url}{contentDTO.TMDB_ID}{RapidAPI_Ending}";

        using var request = new HttpRequestMessage(HttpMethod.Get, url);
        request.Headers.Add(RapidApiKeyHeader, await AWSSecretHelper.GetSecretKey(AWS_Secrets.RapidAPIKey_Main));
        request.Headers.Add(RapidApiHostHeader, RapidApiHostValue);

        using var response = await httpClient.SendAsync(request);
        response.EnsureSuccessStatusCode();
        string? json = await response.Content.ReadAsStringAsync();

        RapidContent? apiContent = JsonSerializer.Deserialize<RapidContent>(json, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
        if (apiContent == null) return null;

        // Set rating to 5 point scale
        apiContent.rating = Math.Round(apiContent.rating / 20.0, 2);

        // Update any missing/expired posters
        Posters posters = new Posters { VerticalPoster = contentDTO.VerticalPoster ?? "", LargeVerticalPoster = contentDTO.LargeVerticalPoster ?? "", HorizontalPoster = contentDTO.HorizontalPoster ?? "" };
        bool refreshVerticalPoster = posterService.ShouldRefreshPoster(posters.VerticalPoster);
        bool refreshLargeVerticalPoster = posterService.ShouldRefreshPoster(posters.LargeVerticalPoster);
        bool refreshHorizontalPoster = posterService.ShouldRefreshPoster(posters.HorizontalPoster);
        if (refreshVerticalPoster || refreshLargeVerticalPoster || refreshHorizontalPoster) {
            posters = await GetPosters(contentDTO.TMDB_ID);
            posters.VerticalPoster = refreshVerticalPoster ? posters.VerticalPoster : contentDTO.VerticalPoster ?? "";
            posters.LargeVerticalPoster = refreshLargeVerticalPoster ? posters.LargeVerticalPoster : contentDTO.LargeVerticalPoster ?? "";
            posters.HorizontalPoster = refreshHorizontalPoster ? posters.HorizontalPoster : contentDTO.HorizontalPoster ?? "";
        }

        contentDTO.VerticalPoster = posters.VerticalPoster;
        contentDTO.LargeVerticalPoster = posters.LargeVerticalPoster;
        contentDTO.HorizontalPoster = posters.HorizontalPoster;

        return await MapRapidContentToContentDetail(apiContent);
    }

    public async Task<List<ContentPartialDTO>> TMDBSearch(string keyword) {
        string url = TMDB_Search_Url + Uri.EscapeDataString(keyword.Trim()) + TMDB_Search_Ending;
        using var request = new HttpRequestMessage(HttpMethod.Get, url);
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", await AWSSecretHelper.GetSecretKey(AWS_Secrets.TMDBBearerToken));
        request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

        using var response = await httpClient.SendAsync(request);
        response.EnsureSuccessStatusCode();
        string json = await response.Content.ReadAsStringAsync();

        var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
        TMDB? data = null;
        try {
            data = JsonSerializer.Deserialize<TMDB>(json, options);
        }
        catch (Exception e) {
            ConsoleLogger.Error("Error deserializing JSON for TMDB search: " + e);
            return new();
        }
        if (data == null) return new();

        // Filter for movies or tv only (no people)
        data.Results = data.Results.Where(x => x.MediaType == TMDBMediaType.Movie || x.MediaType == TMDBMediaType.Tv).ToList();

        foreach (var x in data.Results) {
            x.BackdropPath = string.IsNullOrEmpty(x.BackdropPath)
                ? null
                : "https://image.tmdb.org/t/p/w1280" + x.BackdropPath;

            if (string.IsNullOrEmpty(x.PosterPath)) {
                x.PosterPath = null;
                x.LargePosterPath = null;
            }
            else {
                var tempPoster = x.PosterPath;
                x.PosterPath = "https://image.tmdb.org/t/p/w185" + x.PosterPath;
                x.LargePosterPath = "https://image.tmdb.org/t/p/w500" + tempPoster;
            }
        }

        return data.Results.Select(t => MapTMDBContentToContentPartialDTO(t)).ToList();
    }

    private async Task<Posters> GetPosters(string tmdbID) {
        string url = TMDB_Poster_Url + tmdbID + TMDB_Poster_Ending;
        using var request = new HttpRequestMessage(HttpMethod.Get, url);
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", await AWSSecretHelper.GetSecretKey(AWS_Secrets.TMDBBearerToken));
        request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

        using var response = await httpClient.SendAsync(request);
        response.EnsureSuccessStatusCode();
        string json = await response.Content.ReadAsStringAsync();

        // using var doc = JsonDocument.Parse(json);
        // string verticalPoster = "", largeVerticalPoster = "", horizontalPoster = "";
        // verticalPoster = doc.RootElement.TryGetProperty("poster_path", out var posterPathElem) && posterPathElem.GetString() is string p && !string.IsNullOrEmpty(p)
        //                     ? "https://image.tmdb.org/t/p/w185" + p
        //                     : "";
        // largeVerticalPoster = doc.RootElement.TryGetProperty("poster_path", out var largePosterPathElem) && largePosterPathElem.GetString() is string l && !string.IsNullOrEmpty(l)
        //                     ? "https://image.tmdb.org/t/p/w500" + l
        //                     : "";
        // horizontalPoster = doc.RootElement.TryGetProperty("backdrop_path", out var backPathElem) && backPathElem.GetString() is string b && !string.IsNullOrEmpty(b)
        //                     ? "https://image.tmdb.org/t/p/w1280" + b
        //                     : "";
        var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
        var tmdbContent = JsonSerializer.Deserialize<TMDBContent>(json, options);

        string verticalPoster = !string.IsNullOrEmpty(tmdbContent?.PosterPath)
            ? "https://image.tmdb.org/t/p/w185" + tmdbContent.PosterPath
            : "";

        string largeVerticalPoster = !string.IsNullOrEmpty(tmdbContent?.PosterPath)
            ? "https://image.tmdb.org/t/p/w500" + tmdbContent.PosterPath
            : "";

        string horizontalPoster = !string.IsNullOrEmpty(tmdbContent?.BackdropPath)
            ? "https://image.tmdb.org/t/p/w1280" + tmdbContent.BackdropPath
            : "";

        return new Posters { VerticalPoster = verticalPoster, LargeVerticalPoster = largeVerticalPoster, HorizontalPoster = horizontalPoster };
    }

    // Refresh and save poster URLs when they're either invalid or expiring soon.
    public async Task<bool> RefreshPostersIfNeededAsync(string tmdbId) {
        int refreshed = await RefreshPostersIfNeededAsync(new[] { tmdbId });
        return refreshed > 0;
    }

    // Refreshes and saves poster rows for supplied TMDB IDs when any URL is invalid or expiring.
    // Returns the number of rows updated/created.
    public async Task<int> RefreshPostersIfNeededAsync(IEnumerable<string> tmdbIds) {
        HashSet<string> ids = tmdbIds
            .Where(id => !string.IsNullOrWhiteSpace(id))
            .ToHashSet();

        if (ids.Count == 0) {
            return 0;
        }

        List<Poster> existingPosters = await context.Poster
            .Where(p => ids.Contains(p.TMDB_ID))
            .ToListAsync();

        HashSet<string> existingIds = existingPosters.Select(p => p.TMDB_ID).ToHashSet();
        HashSet<string> idsToRefresh = existingPosters
            .Where(p =>
                posterService.ShouldRefreshPoster(p.VerticalPoster) ||
                posterService.ShouldRefreshPoster(p.LargeVerticalPoster) ||
                posterService.ShouldRefreshPoster(p.HorizontalPoster))
            .Select(p => p.TMDB_ID)
            .ToHashSet();

        // IDs to refresh, yet they aren't saved to the DB yet
        foreach (string missingId in ids.Except(existingIds)) {
            idsToRefresh.Add(missingId);
        }

        if (idsToRefresh.Count == 0) {
            return 0;
        }

        int refreshedCount = 0;
        foreach (string id in idsToRefresh) {
            Posters fetched = await GetPosters(id);
            await posterService.UpsertPoster(
                id,
                fetched.VerticalPoster,
                fetched.LargeVerticalPoster,
                fetched.HorizontalPoster
            );
            refreshedCount++;
        }

        await context.SaveChangesAsync();
        return refreshedCount;
    }

    private ContentPartialDTO MapTMDBContentToContentPartialDTO(TMDBContent tmdb) {
        var isMovie = tmdb.MediaType == TMDBMediaType.Movie;

        return new ContentPartialDTO {
            TMDB_ID = tmdb.MediaType.ToString().ToLower() + "/" + tmdb.ID,
            Title = isMovie ? tmdb.Title ?? string.Empty : tmdb.Name ?? string.Empty,
            Overview = tmdb.Overview ?? string.Empty,
            Rating = Math.Round(tmdb.VoteAverage / 2.0, 2), // convert to 5 point scale
            ReleaseYear = !string.IsNullOrEmpty(tmdb.ReleaseDate) &&
                            int.TryParse(tmdb.ReleaseDate.Split('-')[0], out var releaseDateYear)
                            ? releaseDateYear
                        : !string.IsNullOrEmpty(tmdb.FirstAirDate) &&
                            int.TryParse(tmdb.FirstAirDate.Split('-')[0], out var firstAirDateYear)
                            ? firstAirDateYear
                        : 0,
            VerticalPoster = tmdb.PosterPath,
            LargeVerticalPoster = tmdb.LargePosterPath ?? "",
            HorizontalPoster = tmdb.BackdropPath
        };
    }

    private async Task<ContentDetail> MapRapidContentToContentDetail(RapidContent content) {
        var details = new ContentDetail {
            TMDB_ID = content.tmdbId,
            Title = content.title,
            Overview = content.overview,
            ReleaseYear = content.releaseYear,
            RapidID = content.id,
            IMDB_ID = content.imdbId,
            ShowType = content.showType.ToString().ToLowerInvariant(),
            Cast = content.cast,
            Directors = content.directors,
            Rating = content.rating,
            Runtime = content.runtime,
            SeasonCount = content.seasonCount,
            EpisodeCount = content.episodeCount
        };

        // List<string> genreNames = content.genres.Select(g => g.name).ToList();
        // details.Genres = await context.Genre.Where(g => genreNames.Contains(g.Name)).ToListAsync();
        List<RapidGenre> apiGenres = content.genres; // List<APIGenre>
        List<string> genreNames = apiGenres.Select(g => g.name).ToList();

        List<Genre> existingGenres = await context.Genre.Where(g => genreNames.Contains(g.Name)).ToListAsync();

        HashSet<string> existingGenreNames = existingGenres.Select(g => g.Name).ToHashSet();
        List<RapidGenre> missingGenres = apiGenres.Where(g => !existingGenreNames.Contains(g.name)).ToList();

        var newGenres = new List<Genre>();
        foreach (var apiGenre in missingGenres) {
            Genre genre = await MapRapidGenreToGenre(apiGenre);
            newGenres.Add(genre);
        }
        details.Genres = existingGenres.Concat(newGenres).ToList();

        // Go single threaded and use a map to avoid duplicates
        if (content.streamingOptions.TryGetValue("us", out List<RapidStreamingOption>? options)) {
            var streamingOptionMap = new Dictionary<(string, string), StreamingOption>();
            foreach (var o in options) {
                var key = (details.TMDB_ID, o.service.id);
                if (!streamingOptionMap.ContainsKey(key)) {
                    var so = await MapRapidStreamingOptionToStreamingOption(o, details);
                    streamingOptionMap[key] = so;
                }
            }
            details.StreamingOptions = streamingOptionMap.Values.ToList();
        }
        else {
            details.StreamingOptions = new List<StreamingOption>();
        }

        return details;
    }

    private async Task<Genre> MapRapidGenreToGenre(RapidGenre apiGenre) {
        var genre = context.Genre.Local.FirstOrDefault(g => g.Name == apiGenre.name);
        if (genre != null)
            return genre;

        genre = await context.Genre.FirstOrDefaultAsync(g => g.Name == apiGenre.name);
        if (genre != null)
            return genre;

        genre = new Genre(apiGenre.name);
        await context.Genre.AddAsync(genre);
        return genre;
    }

    private async Task<StreamingOption> MapRapidStreamingOptionToStreamingOption(RapidStreamingOption option, ContentDetail contentDetail) {
        // Find or create the StreamingService
        var serviceName = option.service.name;
        var streamingOption = context.StreamingOption.Local.FirstOrDefault(o => o.TMDB_ID == contentDetail.TMDB_ID && o.StreamingService.Name == serviceName)
                        ?? await context.StreamingOption.FirstOrDefaultAsync(o => o.TMDB_ID == contentDetail.TMDB_ID && o.StreamingService.Name == serviceName);
        if (streamingOption != null) return streamingOption;


        var service = context.StreamingService.Local.FirstOrDefault(s => s.ServiceID == serviceName)
                        ?? await context.StreamingService.FirstOrDefaultAsync(s => s.ServiceID == serviceName);
        if (service == null) {
            service = new StreamingService(option.service.name, option.service.imageSet.lightThemeImage, option.service.imageSet.darkThemeImage);
            await context.StreamingService.AddAsync(service);
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

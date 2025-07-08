using Microsoft.EntityFrameworkCore;
using System.Text.Json;

using API.DTOs;
using API.Infrastructure;
using API.Models;
using AutoMapper;
using System.Net.Http.Headers;

namespace API.Service;

class Posters {
    public string VerticalPoster { get; set; } = string.Empty;
    public string LargeVerticalPoster { get; set; } = string.Empty;
    public string HorizontalPoster { get; set; } = string.Empty;
}

public class APIService {

    private readonly StreamTrackDbContext context;
    private readonly HttpClient httpClient;
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

    public APIService(StreamTrackDbContext _context, HttpClient _httpClient, IMapper _mapper) {
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
                partial.Detail = await FetchContentDetailsByTMDBIDAsync(mapper.Map<ContentPartialDTO, ContentRequestDTO>(partialDTO));
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
    public async Task<ContentDetail?> FetchContentDetailsByTMDBIDAsync(ContentRequestDTO contentDTO) {
        string url = $"{RapidAPI_Base_Url}{contentDTO.TMDB_ID}{RapidAPI_Ending}";

        using var request = new HttpRequestMessage(HttpMethod.Get, url);
        request.Headers.Add(RapidApiKeyHeader, API_KEYS.RAPID);
        request.Headers.Add(RapidApiHostHeader, RapidApiHostValue);

        using var response = await httpClient.SendAsync(request);
        response.EnsureSuccessStatusCode();
        string? json = await response.Content.ReadAsStringAsync();

        RapidContent? apiContent = JsonSerializer.Deserialize<RapidContent>(json, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
        if (apiContent == null) return null;

        // Set rating to 5 point scale
        apiContent.rating = Math.Round(apiContent.rating / 20.0, 2);

        // Update any missing posters
        Posters posters = new Posters { VerticalPoster = contentDTO.VerticalPoster ?? "", LargeVerticalPoster = contentDTO.LargeVerticalPoster ?? "", HorizontalPoster = contentDTO.HorizontalPoster ?? "" };
        bool badVerticalPoster = IsBadPoster(posters.VerticalPoster);
        bool badLargeVerticalPoster = IsBadPoster(posters.LargeVerticalPoster);
        bool badHorizontalPoster = IsBadPoster(posters.HorizontalPoster);
        if (badVerticalPoster || badLargeVerticalPoster || badHorizontalPoster) {
            posters = await GetPosters(contentDTO.TMDB_ID);
            posters.VerticalPoster = badVerticalPoster ? posters.VerticalPoster : contentDTO.VerticalPoster ?? "";
            posters.LargeVerticalPoster = badLargeVerticalPoster ? posters.LargeVerticalPoster : contentDTO.LargeVerticalPoster ?? "";
            posters.HorizontalPoster = badHorizontalPoster ? posters.HorizontalPoster : contentDTO.HorizontalPoster ?? "";
        }

        return await MapRapidContentToContentDetail(apiContent, posters.VerticalPoster, posters.LargeVerticalPoster, posters.HorizontalPoster);
    }

    public async Task<List<ContentPartialDTO>> TMDBSearch(string keyword) {
        string url = TMDB_Search_Url + Uri.EscapeDataString(keyword.Trim()) + TMDB_Search_Ending;
        using var request = new HttpRequestMessage(HttpMethod.Get, url);
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", API_KEYS.TMDB_BEARER_TOKEN);
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
            System.Console.WriteLine("Error deserializing JSON for TMDB search: " + e);
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
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", API_KEYS.TMDB_BEARER_TOKEN);
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

    private bool IsBadPoster(string url) {
        if (string.IsNullOrWhiteSpace(url)) return true;
        var lowered = url.ToLowerInvariant();
        if (lowered.Contains("svg") || lowered.StartsWith("https://www.")) return true;
        return false;
    }

    private ContentPartialDTO MapTMDBContentToContentPartialDTO(TMDBContent tmdb) {
        var isMovie = tmdb.MediaType == TMDBMediaType.Movie;

        return new ContentPartialDTO {
            TMDB_ID = tmdb.MediaType.ToString().ToLower() + "/" + tmdb.ID,
            Title = isMovie ? tmdb.Title ?? string.Empty : tmdb.Name ?? string.Empty,
            Overview = tmdb.Overview ?? string.Empty,
            Rating = Math.Round(tmdb.VoteAverage / 2.0, 2), // convert to 5 point scale
            ReleaseYear = !string.IsNullOrEmpty(tmdb.ReleaseDate) &&
                            int.TryParse(tmdb.ReleaseDate.Split('-')[0], out var year)
                            ? year : 0,
            VerticalPoster = tmdb.PosterPath,
            LargeVerticalPoster = tmdb.LargePosterPath ?? "",
            HorizontalPoster = tmdb.BackdropPath
        };
    }

    private async Task<ContentDetail> MapRapidContentToContentDetail(RapidContent content, string verticalPoster, string largeVerticalPoster, string horizontalPoster) {
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
            EpisodeCount = content.episodeCount,
            VerticalPoster = !string.IsNullOrWhiteSpace(verticalPoster) ? verticalPoster : content.imageSet.verticalPoster.w240 ?? "",
            LargeVerticalPoster = !string.IsNullOrWhiteSpace(largeVerticalPoster) ? largeVerticalPoster : content.imageSet.verticalPoster.w480 ?? "",
            HorizontalPoster = !string.IsNullOrWhiteSpace(horizontalPoster) ? horizontalPoster : content.imageSet.horizontalPoster.w1080 ?? "",
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

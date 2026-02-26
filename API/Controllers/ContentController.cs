using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using AutoMapper;

using API.DTOs;
using API.Infrastructure;
using API.Models;
using API.Service;
using API.Helpers;

namespace API.Controllers;

[Route("API/[controller]")]
[ApiController]
public class ContentController : ControllerBase {

    private readonly StreamTrackDbContext context;
    private readonly HelperService service;
    private readonly PopularSortingService sortingService;
    private readonly APIService APIService;
    private readonly IMapper mapper;

    private const int maxContents = 10; // max amount of contents to take per each section or carousel
    private const int maxSections = 5; // max amount of sections to display
    private const int maxRecommended = 5; // max amount of recommended contents to send (both Info Page and Search Page)
    private static readonly Random rng = new Random();

    // Split on the & for multiple keys
    private static readonly Dictionary<string, string> SECTION_TITLES = new Dictionary<string, string> {
        // Genres
        { "Action", "Action-Packed" },
        { "Romance", "Swoon-Worthy Romance" },
        { "Comedy", "Comedy Gold" },
        { "Documentary", "True Stories" },
        { "Drama", "Pure Drama" },
        { "Sci-Fi", "Sci-Fi Wonders" },
        { "Horror", "Nightmare Fuel" },
        { "Thriller", "Thrilling Rides" },
        { "Western", "Wild West" },

        { "Romance&Comedy", "Love & Laughs" },
        { "Horror&Thriller", "Chills & Thrills" },

        // Services
        { "Netflix", "Popular on Netflix" },
        { "Hulu", "Popular on Hulu" },
        { "Max", "Popular on Max" },
        { "Prime Video", "Popular on Prime Video" },
        { "Disney+", "Popular on Disney+" },
        { "Apple TV", "Popular on Apple TV" },
        { "Paramount+", "Popular on Paramount+" },
        { "Peacock", "Popular on Peacock" },

        { "Only&Netflix", "Only on Netflix" },
        // { "Only&Hulu", "Only on Hulu" }, // Not enough of them lol
        { "Only&Max", "Only on Max" },
        { "Only&Prime Video", "Only on Prime Video" },
        { "Only&Disney+", "Only on Disney+" },
        { "Only&Apple TV", "Only on Apple TV" },
        { "Only&Paramount+", "Only on Paramount+" },
        { "Only&Peacock", "Only on Peacock" },

        // Other Categories
        { "Free", "Free to Stream" },
        { "Movie", "Must-See Movies" },
        { "Series", "Binge-Worthy Shows" },
        { "Rating", "Highly Rated" },
        { "Released", "Released This Year" }
    };


    public ContentController(StreamTrackDbContext _context, HelperService _service, PopularSortingService _sortingService, APIService _APIService, IMapper _mapper) {
        context = _context;
        service = _service;
        sortingService = _sortingService;
        APIService = _APIService;
        mapper = _mapper;
    }

    // GET: API/Content/Search?keyword={keyword}
    [HttpGet("Search")]
    public async Task<ActionResult<List<ContentPartialDTO>>> SearchTMDB([FromQuery] string? keyword = "") {
        // Get the user's auth token to get the firebase uuid to get the correct user's data
        // User's can only get their own data

        string? uid = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrEmpty(uid))
            return Unauthorized();

        var user = await context.User.FirstOrDefaultAsync(u => u.UserID == uid);
        if (user == null) return Unauthorized();

        if (string.IsNullOrWhiteSpace(keyword)) {
            return BadRequest();
        }

        try {
            keyword = Uri.UnescapeDataString(keyword).Trim();
            var contents = await APIService.TMDBSearch(keyword);
            return contents;
        }
        catch (Exception e) {
            ConsoleLogger.Error("Error in Search TMDB: " + e);
            return BadRequest();
        }
    }

    // // GET: API/Content/GetDetails/{tmdbID}
    // [HttpGet("GetDetails/{tmdbID}")]
    // public async Task<ActionResult<ContentDTO>> GetContentDetailsByID(string tmdbID) {
    //     // Get the user's auth token to get the firebase uuid to get the correct user's data
    //     // User's can only get their own data

    //     string? uid = User.FindFirstValue(ClaimTypes.NameIdentifier);

    //     if (string.IsNullOrEmpty(uid))
    //         return Unauthorized();

    //     tmdbID = Uri.UnescapeDataString(tmdbID);

    //     ContentDetail? content = await context.ContentDetail
    //             .Include(c => c.Genres)
    //             .Include(c => c.StreamingOptions)
    //                 .ThenInclude(s => s.StreamingService)
    //             .FirstOrDefaultAsync(c => c.TMDB_ID == tmdbID);
    //     if (content == null) {
    //         return NotFound();
    //     }

    //     return mapper.Map<ContentDetail, ContentDTO>(content);
    // }

    // Doesn't save new content because it only needs to be saved if its in a list or popular,
    //   but if it was in a list or popular, it would already be in the DB
    // POST: API/Content/Info?shouldRefresh={shouldRefresh}
    [HttpPost("Info")]
    public async Task<ActionResult<ContentInfoDTO>> FetchContentInfo([FromBody] ContentRequestDTO requestDTO, [FromQuery] bool? shouldRefresh = false) {
        // Get the user's auth token to get the firebase uuid to get the correct user's data
        // User's can only get their own data

        string? uid = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrEmpty(uid))
            return Unauthorized();

        var user = await context.User.FirstOrDefaultAsync(u => u.UserID == uid);
        if (user == null) return Unauthorized();

        ContentDetail? detail = await context.ContentDetail
                                                .Include(c => c.Genres)
                                                .Include(c => c.StreamingOptions)
                                                    .ThenInclude(s => s.StreamingService)
                                            .FirstOrDefaultAsync(c => c.TMDB_ID == requestDTO.TMDB_ID);

        try {
            if (detail == null) {
                detail = await APIService.FetchContentDetailsByTMDBIDAsync(requestDTO);
                if (detail == null) {
                    return NotFound();
                }
            }
            else if (detail.TTL_UTC < DateTime.UtcNow || shouldRefresh.GetValueOrDefault()) {
                ContentDetail? updatedDetail = await APIService.FetchContentDetailsByTMDBIDAsync(requestDTO);
                if (updatedDetail == null) {
                    return NotFound();
                }
                if (updatedDetail.TMDB_ID != requestDTO.TMDB_ID) {
                    // Should NEVER happen. How would the ID change in the API. Anyways...
                    ConsoleLogger.Error($"Content data TMDB ID changed in RapidAPI: should be {requestDTO.TMDB_ID}, received {updatedDetail.TMDB_ID}");
                    return BadRequest("Content data TMDB ID changed in RapidAPI.");
                }
                // UPDATE
                mapper.Map(updatedDetail, detail); // Update current entity basic properties
                detail.TTL_UTC = DateTime.UtcNow.AddDays(1);
                context.Entry(detail).Property(d => d.TTL_UTC).IsModified = true;

                // Mark JSON fields as updated for EfCore
                detail.Cast = updatedDetail.Cast;
                detail.Directors = updatedDetail.Directors;
                context.Entry(detail).Property(d => d.Cast).IsModified = true;
                context.Entry(detail).Property(d => d.Directors).IsModified = true;

                // For Genres (many-to-many), clear and re-add
                detail.Genres.Clear();
                foreach (var g in updatedDetail.Genres) {
                    var existing = await context.Genre.FindAsync(g.Name);
                    detail.Genres.Add(existing ?? g);
                }

                detail.StreamingOptions.Clear();
                foreach (var o in updatedDetail.StreamingOptions) {
                    detail.StreamingOptions.Add(o);
                }

                ContentPartial? partial = await context.ContentPartial.FirstOrDefaultAsync(c => c.TMDB_ID == requestDTO.TMDB_ID);
                if (partial == null) return BadRequest();

                mapper.Map(detail, partial); // Update current entity basic properties

                partial.Detail = detail;
                detail.Partial = partial;

                await context.SaveChangesAsync();
            }
            await APIService.RefreshExpiredPostersIfNeededAsync(detail);
        }
        catch (Exception e) {
            ConsoleLogger.Error("Error in GetContentDetails: " + e);
            return BadRequest();
        }

        ContentDTO detailDTO = mapper.Map<ContentDetail, ContentDTO>(detail);

        List<ContentPartialDTO> recommendations = await service.GetRecommendations(detail, maxRecommended);

        return new ContentInfoDTO { Content = detailDTO, Recommendations = recommendations };
    }

    // GET: API/Content/GetAll
    [HttpGet("GetAll")]
    public async Task<ActionResult<List<ContentPartialDTO>>> GetAllContent() {

        string? uid = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrEmpty(uid))
            return Unauthorized();

        var user = await context.User.FirstOrDefaultAsync(u => u.UserID == uid);
        if (user == null) return Unauthorized();

        List<ContentPartial> contents = await context.ContentPartial
                                    .ToListAsync();

        return mapper.Map<List<ContentPartial>, List<ContentPartialDTO>>(contents);
    }


    // POPULAR CONTENT:

    // Used to pull popular content for the landing page
    // Count: 10 from carousel + 5 * 10 per section = 10 + 50 = 60 contents
    // GET: API/Content/Popular
    [HttpGet("Popular")]
    public async Task<ActionResult<PopularContentDTO>> GetPopularContent() {
        string? uid = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrEmpty(uid))
            return Unauthorized();

        var user = await context.User.FirstOrDefaultAsync(u => u.UserID == uid);
        if (user == null) return Unauthorized();

        List<ContentDetail> contents = await context.ContentDetail
                .Include(c => c.Genres)
                .Include(c => c.StreamingOptions)
                    .ThenInclude(s => s.StreamingService)
                .Where(c => c.IsPopular) // Only POPULAR content
                .ToListAsync();

        if (contents.Count == 0) {
            return NotFound();
        }

        // Pick 10 random contents for the carousel
        List<ContentSimpleDTO> carousel = contents.OrderBy(_ => rng.Next())
                                                    .Take(maxContents)
                                                    .Select(c => mapper.Map<ContentDetail, ContentSimpleDTO>(c))
                                                    .ToList();

        // Picks 5 random sections and then gets the filtered contents for each section
        Dictionary<string, List<ContentSimpleDTO>> mainContent = SECTION_TITLES
            .OrderBy(_ => rng.Next())
            .Take(maxSections)
            .Select(pair => new {
                Section = pair.Value,  // display name
                Contents = sortingService.filterSectionContent(pair.Key, contents.OrderBy(_ => rng.Next()).ToList(), maxContents)
            })
            .Where(pair => pair.Contents.Count >= 3) // filter out sections without enough contents
            .ToDictionary(
                pair => pair.Section,  // display name
                pair => pair.Contents
            );

        // Pick 5 random for search page
        List<ContentSimpleDTO> search = contents.OrderBy(_ => rng.Next())
                                                    .Take(maxRecommended)
                                                    .Select(c => mapper.Map<ContentDetail, ContentSimpleDTO>(c))
                                                    .ToList();

        PopularContentDTO popularContents = new PopularContentDTO {
            Carousel = carousel,
            Main = mainContent,
            Search = search
        };

        return popularContents;
    }

    // POST: API/Content/Popular/Update
    [HttpPost("Popular/Update")]
    public async Task<ActionResult<ContentDTO>> UpdatePopularContent(List<ContentDTO> dtos) {
        // Only the lambda user will be sending the content

        string? uid = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrEmpty(uid) || uid != await AWSSecretHelper.GetSecretKey(AWS_Secrets.LambdaUID)) {
            return Unauthorized();
        }

        var tmdbIds = dtos.Select(d => d.TMDB_ID).ToList();

        // Find popular and NOT in a list (to delete :) )
        List<ContentPartial> previouslyPopular = await context.ContentPartial
                                .Include(p => p.Lists)
                                .Include(p => p.Detail)
                                .Where(p =>
                                    ((p.Detail == null) || (p.Detail != null && p.Detail.IsPopular))
                                    && !tmdbIds.Contains(p.TMDB_ID)
                                    && p.Lists.Count == 0
                                ).ToListAsync();

        var existingContents = await context.ContentDetail.Where(c => tmdbIds.Contains(c.TMDB_ID)).ToListAsync();

        List<ContentDetail> contents = new();
        foreach (var dto in dtos) {
            ContentDetail? details = await context.ContentDetail.FirstOrDefaultAsync(c => c.TMDB_ID == dto.TMDB_ID);
            if (details == null) {
                details = await service.ContentDTOToContent(dto);
                if (details != null) {
                    contents.Add(details);
                }
            }

            // Should no longer be null
            if (details != null) {
                details.IsPopular = true; // POPULAR

                ContentPartial? partial = await context.ContentPartial.FirstOrDefaultAsync(c => c.TMDB_ID == dto.TMDB_ID);
                if (partial == null) {
                    partial = mapper.Map<ContentDetail, ContentPartial>(details);
                    context.ContentPartial.Add(partial);
                }

                if (partial != null) {
                    partial.Detail = details;
                    details.Partial = partial;
                }
            }
        }

        if (contents.Count > 0) {
            context.ContentDetail.AddRange(contents);
        }

        if (previouslyPopular.Count > 0) {
            context.ContentPartial.RemoveRange(previouslyPopular);
        }

        try {
            await context.SaveChangesAsync();
        }
        catch (Exception ex) {
            ConsoleLogger.Error("Error saving in BulkPopularUpdate: " + ex);
            return BadRequest();
        }

        return Ok();
    }
}

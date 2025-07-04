using API.DTOs;
using API.Infrastructure;
using API.Models;
using AutoMapper;
using Microsoft.IdentityModel.Tokens;

namespace API.Services;

public class PopularSortingService {

    private readonly StreamTrackDbContext context;
    private readonly IMapper mapper;

    public PopularSortingService(StreamTrackDbContext _context, IMapper _mapper) {
        context = _context;
        mapper = _mapper;
    }

    public List<ContentSimpleDTO> filterSectionContent(string section, List<ContentDetail> contents, int maxContents) {
        List<ContentSimpleDTO> filteredContent = new();

        string[] split = section.Split('&');
        if (split.Length > 1) {
            switch (split[0]) {
                case "Romance": // Rom Coms
                case "Horror": // Horror + Thrillers
                    filteredContent = filterGenres(contents, maxContents, split[0], split[1]);
                    break;
                case "Only":
                    switch (split[1]) {
                        case "Netflix":
                        case "Hulu":
                        case "Max":
                        case "Prime Video":
                        case "Disney+":
                        case "Apple TV":
                        case "Paramount+":
                        case "Peacock":
                            filteredContent = filterStreamingServices(contents, maxContents, split[1], true);
                            break;
                        default:
                            break;
                    }
                    break;
                default:
                    break;

            }
        }
        else {
            switch (section) {
                case "Action":
                case "Romance":
                case "Comedy":
                case "Drama":
                case "Sci-Fi":
                case "Horror":
                case "Thriller":
                case "Western":
                    filteredContent = filterGenres(contents, maxContents, section);
                    break;

                case "Netflix":
                case "Hulu":
                case "Max":
                case "Prime Video":
                case "Disney+":
                case "Apple TV":
                case "Paramount+":
                case "Peacock":
                    filteredContent = filterStreamingServices(contents, maxContents, section);
                    break;

                case "Free":
                    filteredContent = contents.Where(c => c.StreamingOptions.Any(o => o.Price == null))
                                                .Take(maxContents)
                                                .Select(c => mapper.Map<ContentDetail, ContentSimpleDTO>(c))
                                                .ToList();
                    break;
                case "Movie":
                    filteredContent = contents.Where(c => c.ShowType.ToLower() == "movie")
                                                .Take(maxContents)
                                                .Select(c => mapper.Map<ContentDetail, ContentSimpleDTO>(c))
                                                .ToList();
                    break;
                case "Series":
                    filteredContent = contents.Where(c => c.ShowType.ToLower() == "series")
                                                .Take(maxContents)
                                                .Select(c => mapper.Map<ContentDetail, ContentSimpleDTO>(c))
                                                .ToList();
                    break;
                case "Rating":
                    filteredContent = contents.Where(c => c.Rating >= 4.5) // 90% rating or better
                                                .Take(maxContents)
                                                .Select(c => mapper.Map<ContentDetail, ContentSimpleDTO>(c))
                                                .ToList();
                    break;
                case "Released":
                    var currentYear = DateTime.Now.Year;
                    filteredContent = contents.Where(c => c.ReleaseYear == currentYear) // Released this year
                                                .Take(maxContents)
                                                .Select(c => mapper.Map<ContentDetail, ContentSimpleDTO>(c))
                                                .ToList();
                    break;
                default:
                    break;
            }
        }

        return filteredContent;
    }

    // Filters for 1 or more genres
    public List<ContentSimpleDTO> filterGenres(List<ContentDetail> contents, int maxContents, params string[] genres) {
        if (genres.Length == 0) return new();

        List<string> lowerGenres = genres.Select(g => g.ToLower()).ToList();
        return contents.Where(c => lowerGenres.All(genre => c.Genres.Any(g => g.Name.ToLower().Equals(genre))))
                        .Take(maxContents)
                        .Select(c => mapper.Map<ContentDetail, ContentSimpleDTO>(c))
                        .ToList();
    }

    public List<ContentSimpleDTO> filterStreamingServices(List<ContentDetail> contents, int maxContents, string streamingService, bool only = false) {
        if (streamingService.IsNullOrEmpty()) return new();

        string lowerStreamingService = streamingService.ToLower();
        if (only) {
            return contents.Where(c => {
                var hashSet = c.StreamingOptions.Select(o => o.StreamingService.Name.ToLower()).ToHashSet();
                return hashSet.Count == 1 && hashSet.Contains(lowerStreamingService);
            })
            .Take(maxContents)
            .Select(c => mapper.Map<ContentDetail, ContentSimpleDTO>(c))
            .ToList();
        }
        else {
            return contents.Where(c => c.StreamingOptions.Any(o => o.StreamingService.Name.ToLower().Equals(lowerStreamingService)))
                            .Take(maxContents)
                            .Select(c => mapper.Map<ContentDetail, ContentSimpleDTO>(c))
                            .ToList();
        }
    }

}
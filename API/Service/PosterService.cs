using API.Infrastructure;
using API.Models;
using Microsoft.EntityFrameworkCore;

namespace API.Service;

public class PosterService {
    private readonly StreamTrackDbContext context;

    public PosterService(StreamTrackDbContext _context) {
        context = _context;
    }

    // Does not save changes. Caller controls transaction boundaries.
    public async Task<Poster?> UpsertPoster(string tmdbId, string? vertical, string? largeVertical, string? horizontal) {
        var partialExists = context.ContentPartial.Local.Any(c => c.TMDB_ID == tmdbId)
            || await context.ContentPartial.AnyAsync(c => c.TMDB_ID == tmdbId);
        if (!partialExists) {
            return null;
        }

        Poster? poster = await context.Poster.FirstOrDefaultAsync(p => p.TMDB_ID == tmdbId);
        if (poster == null) {
            poster = new Poster {
                TMDB_ID = tmdbId,
                VerticalPoster = !string.IsNullOrWhiteSpace(vertical) ? vertical : string.Empty,
                LargeVerticalPoster = !string.IsNullOrWhiteSpace(largeVertical) ? largeVertical : string.Empty,
                HorizontalPoster = !string.IsNullOrWhiteSpace(horizontal) ? horizontal : string.Empty
            };
            context.Poster.Add(poster);
            return poster;
        }

        if (!string.IsNullOrWhiteSpace(vertical)) poster.VerticalPoster = vertical;
        if (!string.IsNullOrWhiteSpace(largeVertical)) poster.LargeVerticalPoster = largeVertical;
        if (!string.IsNullOrWhiteSpace(horizontal)) poster.HorizontalPoster = horizontal;

        return poster;
    }
}

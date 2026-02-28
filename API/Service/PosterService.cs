using System.Text.RegularExpressions;
using API.Infrastructure;
using API.Models;
using Microsoft.EntityFrameworkCore;

namespace API.Service;

public class PosterService {
    private readonly StreamTrackDbContext context;

    private static readonly Regex ExpiresRegex = new Regex(@"(?:^|[?&])Expires=(\d+)(?:&|$)", RegexOptions.Compiled | RegexOptions.IgnoreCase);

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

    public bool ShouldRefreshPoster(string? url) {
        return IsBadPoster(url ?? string.Empty) || IsExpiringSoon(url);
    }

    public bool IsBadPoster(string url) {
        if (string.IsNullOrWhiteSpace(url)) return true;
        var lowered = url.ToLowerInvariant();
        if (lowered.Contains("svg") || lowered.StartsWith("https://www.")) return true;
        return false;
    }

    public bool IsExpiringSoon(string? url) {
        if (string.IsNullOrWhiteSpace(url)) return true;

        Match match = ExpiresRegex.Match(url);
        if (!match.Success) return false; // TMDB Poster URLs don't expire
        
        if (!long.TryParse(match.Groups[1].Value, out long epochSeconds)) {
            return false;
        }

        DateTimeOffset expiresAt = DateTimeOffset.FromUnixTimeSeconds(epochSeconds);
        return expiresAt <= DateTimeOffset.UtcNow.AddDays(1);
    }
}

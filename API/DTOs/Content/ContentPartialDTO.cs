using System.Text.Json.Serialization;

namespace API.DTOs;

// Used for Library Page and lists. Everything from TMDB and exactly what ContentPartial has
public class ContentPartialDTO {

    [JsonPropertyName("tmdbID")]
    public string TMDB_ID { get; set; } = string.Empty;

    public string Title { get; set; } = string.Empty;

    public string Overview { get; set; } = string.Empty;

    public double Rating { get; set; }

    public int ReleaseYear { get; set; }

    public string? VerticalPoster { get; set; }

    public string? LargeVerticalPoster { get; set; }

    public string? HorizontalPoster { get; set; }

    public override bool Equals(object? obj) =>
        obj is ContentPartialDTO other && TMDB_ID == other.TMDB_ID;

    public override int GetHashCode() =>
        TMDB_ID.GetHashCode();

}
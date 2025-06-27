using System.Text.Json.Serialization;

namespace API.DTOs;

// Used for Library Page and lists
public class ContentMinimalDTO {

    [JsonPropertyName("tmdbID")]
    public string TMDB_ID { get; set; } = string.Empty;

    public string Title { get; set; } = string.Empty;

    public int ReleaseYear { get; set; }

    public string VerticalPoster { get; set; } = string.Empty;

    public string HorizontalPoster { get; set; } = string.Empty;

    public override bool Equals(object? obj) =>
        obj is ContentMinimalDTO other && TMDB_ID == other.TMDB_ID;

    public override int GetHashCode() =>
        TMDB_ID.GetHashCode();

}
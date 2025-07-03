
using System.Text.Json.Serialization;

namespace API.DTOs;

// Landing Page
public class ContentSimpleDTO {

    [JsonPropertyName("tmdbID")]
    public string TMDB_ID { get; set; } = string.Empty;

    public string Title { get; set; } = string.Empty;

    public string ShowType { get; set; } = string.Empty;

    public double Rating { get; set; } = 0.0;

    public List<string> GenreNames { get; set; } = new();

    public List<string> StreamingServiceNames { get; set; } = new();

    public string VerticalPoster { get; set; } = string.Empty;

    public string HorizontalPoster { get; set; } = string.Empty;

}
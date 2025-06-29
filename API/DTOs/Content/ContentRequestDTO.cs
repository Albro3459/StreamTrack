using System.Text.Json.Serialization;

namespace API.DTOs;

// Received on InfoPage to getContentDetails
public class ContentRequestDTO {

    [JsonPropertyName("tmdbID")]
    public string TMDB_ID { get; set; } = string.Empty;
    public string? VerticalPoster { get; set; }

    public string? HorizontalPoster { get; set; }
}
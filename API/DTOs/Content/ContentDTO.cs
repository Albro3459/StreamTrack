
using System.Text.Json.Serialization;

namespace API.DTOs;

public class ContentDTO {

    [JsonPropertyName("tmdbID")]
    public string TMDB_ID { get; set; } = string.Empty;

    public string Title { get; set; } = string.Empty;

    public string Overview { get; set; } = string.Empty;

    public int ReleaseYear { get; set; }

    public string RapidID { get; set; } = string.Empty;

    [JsonPropertyName("imdbID")]
    public string IMDB_ID { get; set; } = string.Empty;

    public string ShowType { get; set; } = string.Empty;

    public List<GenreDTO> Genres { get; set; } = new List<GenreDTO>();

    public List<string> Cast { get; set; } = new();

    public List<string> Directors { get; set; } = new();

    public double Rating { get; set; }

    public int? Runtime { get; set; }

    public int? SeasonCount { get; set; }

    public int? EpisodeCount { get; set; }

    public List<StreamingOptionDTO> StreamingOptions { get; set; } = new();

    public string VerticalPoster { get; set; } = string.Empty;

    public string LargeVerticalPoster { get; set; } = string.Empty;

    public string HorizontalPoster { get; set; } = string.Empty;

}
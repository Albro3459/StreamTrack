using System.Text.Json.Serialization;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum TMDBMediaType {
    [JsonPropertyName("movie")]
    Movie,

    [JsonPropertyName("tv")]
    Tv,

    [JsonPropertyName("person")]
    Person,

    [JsonPropertyName("collection")]
    Collection,
}

public class TMDBContent {
    [JsonPropertyName("id")]
    public int ID { get; set; }

    // Movie
    [JsonPropertyName("title")]
    public string? Title { get; set; }

    [JsonPropertyName("original_title")]
    public string? OriginalTitle { get; set; }

    // TV Show
    [JsonPropertyName("name")]
    public string? Name { get; set; }

    [JsonPropertyName("original_name")]
    public string? OriginalName { get; set; }

    // Both
    [JsonPropertyName("overview")]
    public string Overview { get; set; } = string.Empty;

    [JsonPropertyName("poster_path")]
    public string? PosterPath { get; set; }

    [JsonPropertyName("backdrop_path")]
    public string? BackdropPath { get; set; }

    [JsonPropertyName("media_type")]
    public TMDBMediaType MediaType { get; set; }

    [JsonPropertyName("adult")]
    public bool Adult { get; set; }

    [JsonPropertyName("original_language")]
    public string OriginalLanguage { get; set; } = string.Empty;

    [JsonPropertyName("genre_ids")]
    public List<int> GenreIds { get; set; } = new();

    [JsonPropertyName("popularity")]
    public double Popularity { get; set; }

    [JsonPropertyName("release_date")]
    public string? ReleaseDate { get; set; } = string.Empty; // Movies

    [JsonPropertyName("first_air_date")]
    public string? FirstAirDate { get; set; } = string.Empty; // TV Shows

    [JsonPropertyName("video")]
    public bool? Video { get; set; }

    [JsonPropertyName("vote_average")]
    public double VoteAverage { get; set; }

    [JsonPropertyName("vote_count")]
    public int VoteCount { get; set; }

    // CUSTOM
    [JsonPropertyName("large_poster_path")]
    public string? LargePosterPath { get; set; }
}

public class TMDB {
    [JsonPropertyName("page")]
    public int Page { get; set; }

    [JsonPropertyName("results")]
    public List<TMDBContent> Results { get; set; } = new();

    [JsonPropertyName("total_pages")]
    public int TotalPages { get; set; }

    [JsonPropertyName("total_results")]
    public int TotalResults { get; set; }
}
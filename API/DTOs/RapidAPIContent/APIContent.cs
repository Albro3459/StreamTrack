using System.Text.Json.Serialization;

namespace API.DTOs;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum ShowType {
    [JsonPropertyName("movie")]
    Movie,
    [JsonPropertyName("series")]
    Series
}

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum StreamingOptionType {
    [JsonPropertyName("addon")]
    AddOn,
    [JsonPropertyName("buy")]
    Buy,
    [JsonPropertyName("rent")]
    Rent,
    [JsonPropertyName("subscription")]
    Subscription
}

public class APIContent {
    public string itemType { get; set; } = "show"; // Always "show"
    public ShowType showType { get; set; } = ShowType.Movie; // "movie" or "series", maybe default to movie
    public string id { get; set; } = string.Empty;
    public string imdbId { get; set; } = string.Empty;
    public string tmdbId { get; set; } = string.Empty;
    public string title { get; set; } = string.Empty;
    public string overview { get; set; } = string.Empty;
    public int releaseYear { get; set; }
    public string originalTitle { get; set; } = string.Empty;
    public List<APIGenre> genres { get; set; } = new();
    public List<string> directors { get; set; } = new();
    public List<string> cast { get; set; } = new();
    public int rating { get; set; }
    public int? runtime { get; set; }
    public int? seasonCount { get; set; }
    public int? episodeCount { get; set; }
    public APIImageSet imageSet { get; set; } = new();
    public Dictionary<string, List<APIStreamingOption>> streamingOptions { get; set; } = new();
}

public class APIGenre {
    public string id { get; set; } = string.Empty;
    public string name { get; set; } = string.Empty;
}

public class APIImageSet {
    public APIImageResolution verticalPoster { get; set; } = new();
    public APIImageResolution horizontalPoster { get; set; } = new();
    public APIImageResolution verticalBackdrop { get; set; } = new();
    public APIImageResolution horizontalBackdrop { get; set; } = new();
}

public class APIImageResolution {
    public string? w240 { get; set; }
    public string? w360 { get; set; }
    public string? w480 { get; set; }
    public string? w600 { get; set; }
    public string? w720 { get; set; }
    public string? w1080 { get; set; }
    public string? w1440 { get; set; }
}

public class APIStreamingOption {
    public APIService service { get; set; } = new();
    public StreamingOptionType type { get; set; } = StreamingOptionType.Subscription; // "addon", "buy", "rent", "subscription", maybe default to subscription
    public string link { get; set; } = string.Empty;
    public string? videoLink { get; set; }
    public string quality { get; set; } = string.Empty;
    public List<APIAudio> audios { get; set; } = new();
    public List<APISubtitle> subtitles { get; set; } = new();
    public APIPrice? price { get; set; }
    public bool expiresSoon { get; set; }
    public long? expiresOn { get; set; }
    public long availableSince { get; set; }
}

public class APIService {
    public string id { get; set; } = string.Empty;
    public string name { get; set; } = string.Empty;
    public string homePage { get; set; } = string.Empty;
    public string themeColorCode { get; set; } = string.Empty;
    public APIServiceImageSet imageSet { get; set; } = new();
}

public class APIServiceImageSet {
    public string lightThemeImage { get; set; } = string.Empty;
    public string darkThemeImage { get; set; } = string.Empty;
    public string whiteImage { get; set; } = string.Empty;
}

public class APIAudio {
    public string language { get; set; } = string.Empty;
    public string? region { get; set; }
}

public class APISubtitle {
    public bool closedCaptions { get; set; }
    public APISubtitleLocale locale { get; set; } = new();
}

public class APISubtitleLocale {
    public string language { get; set; } = string.Empty;
}

public class APIPrice {
    public string amount { get; set; } = string.Empty;
    public string currency { get; set; } = string.Empty;
    public string formatted { get; set; } = string.Empty;
}

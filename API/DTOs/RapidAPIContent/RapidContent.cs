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

    [JsonPropertyName("free")]
    Free,

    [JsonPropertyName("rent")]
    Rent,

    [JsonPropertyName("subscription")]
    Subscription
}

public class RapidContent {
    public string itemType { get; set; } = "show"; // Always "show"
    public ShowType showType { get; set; } = ShowType.Movie; // "movie" or "series", maybe default to movie
    public string id { get; set; } = string.Empty;
    public string imdbId { get; set; } = string.Empty;
    public string tmdbId { get; set; } = string.Empty;
    public string title { get; set; } = string.Empty;
    public string overview { get; set; } = string.Empty;
    public int releaseYear { get; set; }
    public string originalTitle { get; set; } = string.Empty;
    public List<RapidGenre> genres { get; set; } = new();
    public List<string> directors { get; set; } = new();
    public List<string> cast { get; set; } = new();
    public double rating { get; set; } // double to convert it to a 5 point scale
    public int? runtime { get; set; }
    public int? seasonCount { get; set; }
    public int? episodeCount { get; set; }
    public RapidImageSet imageSet { get; set; } = new();
    public Dictionary<string, List<RapidStreamingOption>> streamingOptions { get; set; } = new();
}

public class RapidGenre {
    public string id { get; set; } = string.Empty;
    public string name { get; set; } = string.Empty;
}

public class RapidImageSet {
    public RapidImageResolution verticalPoster { get; set; } = new();
    public RapidImageResolution horizontalPoster { get; set; } = new();
    public RapidImageResolution verticalBackdrop { get; set; } = new();
    public RapidImageResolution horizontalBackdrop { get; set; } = new();
}

public class RapidImageResolution {
    public string? w240 { get; set; }
    public string? w360 { get; set; }
    public string? w480 { get; set; }
    public string? w600 { get; set; }
    public string? w720 { get; set; }
    public string? w1080 { get; set; }
    public string? w1440 { get; set; }
}

public class RapidStreamingOption {
    public RapidStreamingService service { get; set; } = new();
    public StreamingOptionType type { get; set; } = StreamingOptionType.Subscription; // "addon", "buy", "free", "rent", "subscription", maybe default to subscription
    public string link { get; set; } = string.Empty;
    public string? videoLink { get; set; }
    public string quality { get; set; } = string.Empty;
    public List<RapidAudio> audios { get; set; } = new();
    public List<RapidSubtitle> subtitles { get; set; } = new();
    public RapidPrice? price { get; set; }
    public bool expiresSoon { get; set; }
    public long? expiresOn { get; set; }
    public long availableSince { get; set; }
}

public class RapidStreamingService {
    public string id { get; set; } = string.Empty;
    public string name { get; set; } = string.Empty;
    public string homePage { get; set; } = string.Empty;
    public string themeColorCode { get; set; } = string.Empty;
    public RapidStreamingServiceImageSet imageSet { get; set; } = new();
}

public class RapidStreamingServiceImageSet {
    public string lightThemeImage { get; set; } = string.Empty;
    public string darkThemeImage { get; set; } = string.Empty;
    public string whiteImage { get; set; } = string.Empty;
}

public class RapidAudio {
    public string language { get; set; } = string.Empty;
    public string? region { get; set; }
}

public class RapidSubtitle {
    public bool closedCaptions { get; set; }
    public RapidSubtitleLocale locale { get; set; } = new();
}

public class RapidSubtitleLocale {
    public string language { get; set; } = string.Empty;
}

public class RapidPrice {
    public string amount { get; set; } = string.Empty;
    public string currency { get; set; } = string.Empty;
    public string formatted { get; set; } = string.Empty;
}

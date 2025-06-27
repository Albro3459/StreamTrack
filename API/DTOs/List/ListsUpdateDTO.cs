
using System.Text.Json.Serialization;

namespace API.DTOs;

public class ListsUpdateDTO {

    [JsonPropertyName("tmdbID")]
    public string TMDB_ID { get; set; } = string.Empty;

    public List<string> AddToLists { get; set; } = new();

    public List<string> RemoveFromLists { get; set; } = new();

}
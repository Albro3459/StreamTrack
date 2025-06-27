using System.Text.Json.Serialization;

namespace API.DTOs;

public class ListMinimalDTO {

    public bool IsOwner { get; set; } = false;

    public string ListName { get; set; } = string.Empty;

    [JsonPropertyName("tmdbIDs")]
    public List<string> TMDB_IDs { get; set; } = new();

    // public string Permission { get; set; } = string.Empty;

}
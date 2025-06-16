using System.ComponentModel.DataAnnotations;

namespace API.Models;

public class Content {
    [Key]
    [Required]
    public string ContentID { get; set; } = string.Empty;

    [Required]
    public string Title { get; set; } = string.Empty;

    [Required]
    public string Overview { get; set; } = string.Empty;

    [Required]
    public int ReleaseYear { get; set; }

    [Required]
    public string IMDB_ID { get; set; } = string.Empty;

    [Required]
    public string TMDB_ID { get; set; } = string.Empty;

    [Required]
    public string ShowType { get; set; } = string.Empty;

    public ICollection<Genre> Genres { get; set; } = new List<Genre>();

    [Required]
    public List<string> Cast { get; set; } = new(); // string[] that will be stored in the DB as JSON

    [Required]
    public List<string> Directors { get; set; } = new(); // string[] that will be stored in the DB as JSON

    [Required]
    public int Rating { get; set; }

    public int? Runtime { get; set; }

    public int? SeasonCount { get; set; }

    public int? EpisodeCount { get; set; }

    public ICollection<StreamingOption> StreamingOptions { get; set; } = new List<StreamingOption>();

    [Required]
    public string VerticalPoster { get; set; } = string.Empty;

    [Required]
    public string HorizontalPoster { get; set; } = string.Empty;

    public ICollection<List> Lists { get; set; } = new List<List>();
}
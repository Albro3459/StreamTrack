using System.ComponentModel.DataAnnotations;

namespace API.Models;

public class Poster {
    [Key]
    [Required]
    public string TMDB_ID { get; set; } = string.Empty;

    [Required]
    public string VerticalPoster { get; set; } = string.Empty;

    [Required]
    public string LargeVerticalPoster { get; set; } = string.Empty;

    [Required]
    public string HorizontalPoster { get; set; } = string.Empty;

    [Required]
    public ContentPartial Partial { get; set; } = null!;
}

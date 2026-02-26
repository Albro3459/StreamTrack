using System.ComponentModel.DataAnnotations;

namespace API.Models;


// Everything we want that comes from TMDB
public class ContentPartial : SoftDeletableEntity {
    [Key]
    [Required]
    public string TMDB_ID { get; set; } = string.Empty;

    public ContentDetail? Detail { get; set; }

    [Required]
    public string Title { get; set; } = string.Empty;

    [Required]
    public string Overview { get; set; } = string.Empty;

    [Required]
    public double Rating { get; set; }

    [Required]
    public int ReleaseYear { get; set; }

    [Required]
    public Poster Poster { get; set; } = null!;

    public ICollection<List> Lists { get; set; } = new List<List>();
}

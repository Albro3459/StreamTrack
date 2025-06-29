using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

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
    public string VerticalPoster { get; set; } = string.Empty;

    [Required]
    public string HorizontalPoster { get; set; } = string.Empty;

    public ICollection<List> Lists { get; set; } = new List<List>();
}
using System.ComponentModel.DataAnnotations;

namespace API.Models;

public class Genre : SoftDeletableEntity {
    [Key]
    [Required]
    public string GenreID { get; set; } = string.Empty;

    [Required]
    public string Name { get; set; } = string.Empty;

    public ICollection<Content> Contents { get; set; } = new List<Content>();
    public ICollection<User> Users { get; set; } = new List<User>();

    public Genre() { }

    public Genre(string Name) {
        this.GenreID = Guid.NewGuid().ToString();
        this.Name = Name;
    }

}
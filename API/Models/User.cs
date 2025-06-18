using System.ComponentModel.DataAnnotations;

namespace API.Models;

public class User : SoftDeletableEntity {
    [Key]
    [Required]
    public string UserID { get; set; } = string.Empty;

    [Required]
    public string Email { get; set; } = string.Empty;

    public ICollection<List> OwnedLists { get; set; } = new List<List>();

    public ICollection<ListShares> ListShares { get; set; } = new List<ListShares>();

    public ICollection<Genre> Genres { get; set; } = new List<Genre>();

    public ICollection<StreamingService> StreamingServices { get; set; } = new List<StreamingService>();

}
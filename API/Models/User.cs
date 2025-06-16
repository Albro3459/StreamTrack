using System.ComponentModel.DataAnnotations;

namespace API.Models;

public class User {
    [Key]
    [Required]
    public string UserID { get; set; } = string.Empty;

    [Required]
    public string Email { get; set; } = string.Empty;

    public ICollection<List> OwnedLists { get; set; } = new List<List>();

    public ICollection<ListShares> ListShares { get; set; } = new List<ListShares>();

    public ICollection<StreamingService> StreamingServices { get; set; } = new List<StreamingService>();

    public ICollection<Genre> Genres { get; set; } = new List<Genre>();
}
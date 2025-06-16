using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace API.Models;

public class List {
    [Key]
    [Required]
    public string ListID { get; set; } = string.Empty;

    [Required]
    public string OwnerUserID { get; set; } = string.Empty;

    [ForeignKey(nameof(OwnerUserID))]
    [Required]
    public User Owner { get; set; } = null!;

    [Required]
    public string ListName { get; set; } = string.Empty;

    public ICollection<ListShares> ListShares { get; set; } = new List<ListShares>();

    public ICollection<Content> Contents { get; set; } = new List<Content>();

    [Timestamp] // Token for concurrency with EF Core
    public byte[] Version { get; set; } = null!;

}
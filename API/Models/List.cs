using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace API.Models;

public class List : SoftDeletableEntity {
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
    public byte[]? Version { get; set; }

    public List() { }

    public List(User Owner, string ListName) {
        this.ListID = Guid.NewGuid().ToString();
        this.OwnerUserID = Owner.UserID;
        this.Owner = Owner;
        this.ListName = ListName;
    }

}
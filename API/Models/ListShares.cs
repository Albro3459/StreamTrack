using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace API.Models;

public class ListShares {
    [Key, Column(Order = 0)]
    [Required]
    public string ListID { get; set; } = string.Empty;

    [ForeignKey(nameof(ListID))]
    public List List { get; set; } = null!;

    [Key, Column(Order = 1)]
    [Required]
    public string UserID { get; set; } = string.Empty;

    [ForeignKey(nameof(UserID))]
    public User User { get; set; } = null!;

    [Required]
    public string Permission { get; set; } = string.Empty;
}
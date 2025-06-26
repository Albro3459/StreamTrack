using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;

namespace API.Models;

[Index(nameof(Email), IsUnique = true)]
public class User : SoftDeletableEntity {
    [Key]
    [Required]
    public string UserID { get; set; } = string.Empty;

    [Required]
    public string Email { get; set; } = string.Empty;

    public string FirstName { get; set; } = string.Empty;

    public string LastName { get; set; } = string.Empty;

    public ICollection<List> ListsOwned { get; set; } = new List<List>();

    public ICollection<ListShares> ListShares { get; set; } = new List<ListShares>();

    public ICollection<Genre> Genres { get; set; } = new List<Genre>();

    public ICollection<StreamingService> StreamingServices { get; set; } = new List<StreamingService>();

    // Constructors
    public User() { }

    public User(string UserID, string Email) {
        this.UserID = UserID;
        this.Email = Email;
    }

    public User(string UserID, string Email, string FirstName, string LastName) {
        this.UserID = UserID;
        this.Email = Email;
        this.FirstName = FirstName;
        this.LastName = LastName;
    }

}
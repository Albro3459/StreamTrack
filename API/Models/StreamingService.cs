using System.ComponentModel.DataAnnotations;

namespace API.Models;

public class StreamingService {
    [Key]
    [Required]
    public string ServiceID { get; set; } = string.Empty;

    [Required]
    public string Name { get; set; } = string.Empty;

    [Required]
    public string Logo { get; set; } = string.Empty;

    public ICollection<User> Users { get; set; } = new List<User>();

    public ICollection<StreamingOption> StreamingOptions { get; set; } = new List<StreamingOption>();
}
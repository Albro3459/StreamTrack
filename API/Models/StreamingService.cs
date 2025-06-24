using System.ComponentModel.DataAnnotations;

namespace API.Models;

public class StreamingService : SoftDeletableEntity {
    [Key]
    [Required]
    public string ServiceID { get; set; } = string.Empty;

    [Required]
    public string Name { get; set; } = string.Empty;

    [Required]
    public string LightLogo { get; set; } = string.Empty;

    public string DarkLogo { get; set; } = string.Empty;

    public ICollection<User> Users { get; set; } = new List<User>();

    public ICollection<StreamingOption> StreamingOptions { get; set; } = new List<StreamingOption>();

    public StreamingService() { }
    public StreamingService(string Name, string LightLogo, string DarkLogo) {
        this.ServiceID = Guid.NewGuid().ToString();
        this.Name = Name;
        this.LightLogo = LightLogo;
        this.DarkLogo = DarkLogo;
    }
}
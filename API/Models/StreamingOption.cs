using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace API.Models;

public class StreamingOption {
    [Key, Column(Order = 0)]
    [Required]
    public string ContentID { get; set; } = string.Empty;

    [ForeignKey(nameof(ContentID))]
    public Content Content { get; set; } = null!;

    [Key, Column(Order = 1)]
    [Required]
    public string ServiceID { get; set; } = string.Empty;

    [ForeignKey(nameof(ServiceID))]
    public StreamingService StreamingService { get; set; } = null!;

    [Required]
    public string Type { get; set; } = string.Empty;

    public string? Price { get; set; }

    [Required]
    public string DeepLink { get; set; } = string.Empty;
}
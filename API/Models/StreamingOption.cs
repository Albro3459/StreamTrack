using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace API.Models;

public class StreamingOption {
    [Key, Column(Order = 0)]
    [Required]
    public string TMDB_ID { get; set; } = string.Empty;

    [ForeignKey(nameof(TMDB_ID))]
    public ContentDetail ContentDetails { get; set; } = null!;

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

    public StreamingOption() { }
    public StreamingOption(ContentDetail ContentDetails, StreamingService StreamingService, string Type, string? Price, string DeepLink) {
        this.TMDB_ID = ContentDetails.TMDB_ID;
        this.ContentDetails = ContentDetails;
        this.ServiceID = StreamingService.ServiceID;
        this.StreamingService = StreamingService;
        this.Type = Type;
        this.Price = Price;
        this.DeepLink = DeepLink;
    }
}
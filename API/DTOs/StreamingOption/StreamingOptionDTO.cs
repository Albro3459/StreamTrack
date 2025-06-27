
namespace API.DTOs;

public class StreamingOptionDTO {

    public StreamingServiceDTO StreamingService { get; set; } = null!;

    public string Type { get; set; } = string.Empty;

    public string? Price { get; set; }

    public string DeepLink { get; set; } = string.Empty;

}
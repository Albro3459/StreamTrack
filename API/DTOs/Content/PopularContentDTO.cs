
namespace API.DTOs;

// Landing Page
public class PopularContentDTO {

    // Should be 10 random popular contents
    public List<ContentSimpleDTO> Carousel { get; set; } = new();

    // Section name to popular contents
    public Dictionary<string, List<ContentSimpleDTO>> Main { get; set; } = new();

}
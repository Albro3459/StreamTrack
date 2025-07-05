namespace API.DTOs;

public class ContentInfoDTO {
    public ContentDTO Content { get; set; } = new();

    public List<ContentPartialDTO> Recommendations { get; set; } = new();
}
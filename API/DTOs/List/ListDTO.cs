
namespace API.DTOs;

public class ListDTO {

    public bool IsOwner { get; set; } = false;

    public string ListName { get; set; } = string.Empty;

    public List<ContentDTO> Contents { get; set; } = new();

    // public string Permission { get; set; } = string.Empty;

}
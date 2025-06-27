
namespace API.DTOs;

public class ListMinimalDTO {

    public bool IsOwner { get; set; } = false;

    public string ListName { get; set; } = string.Empty;

    public List<string> ContentIDs { get; set; } = new();

    // public string Permission { get; set; } = string.Empty;

}
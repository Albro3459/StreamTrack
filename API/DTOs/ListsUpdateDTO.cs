
namespace API.DTOs;

public class ListsUpdateDTO {

    public string ContentID { get; set; } = string.Empty;

    public List<string> AddToLists { get; set; } = new();

    public List<string> RemoveFromLists { get; set; } = new();

}
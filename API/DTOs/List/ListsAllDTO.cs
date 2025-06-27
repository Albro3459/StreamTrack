
namespace API.DTOs;

public class ListsAllDTO {

    public List<ListDTO> ListsOwned { get; set; } = new();

    public List<ListDTO> ListsSharedWithMe { get; set; } = new();

    public List<ListDTO> ListsSharedWithOthers { get; set; } = new();

}
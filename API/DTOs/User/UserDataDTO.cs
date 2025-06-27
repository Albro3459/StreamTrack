
namespace API.DTOs;

public class UserDataDTO {
    public string Email { get; set; } = string.Empty;

    public string FirstName { get; set; } = string.Empty;

    public string LastName { get; set; } = string.Empty;

    public List<ListDTO> ListsOwned { get; set; } = new();

    public List<ListDTO> ListsSharedWithMe { get; set; } = new();

    public List<ListDTO> ListsSharedWithOthers { get; set; } = new();

    public List<GenreDTO> Genres { get; set; } = new();

    public List<StreamingServiceDTO> StreamingServices { get; set; } = new();

}
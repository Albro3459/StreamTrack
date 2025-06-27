
namespace API.DTOs;


// Pulled for lists/library and profile page
public class UserMinimalDataDTO {
    public string Email { get; set; } = string.Empty;

    public string FirstName { get; set; } = string.Empty;

    public string LastName { get; set; } = string.Empty;

    public List<ListMinimalDTO> ListsOwned { get; set; } = new();

    public List<ListMinimalDTO> ListsSharedWithMe { get; set; } = new();

    public List<ListMinimalDTO> ListsSharedWithOthers { get; set; } = new();

    public List<string> Genres { get; set; } = new();

    public List<StreamingServiceDTO> StreamingServices { get; set; } = new();

}
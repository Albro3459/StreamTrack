
namespace API.DTOs;

public class UserUpdateProfileDataDTO {
    public string FirstName { get; set; } = string.Empty;

    public string LastName { get; set; } = string.Empty;

    public List<string> Genres { get; set; } = new();

    public List<string> StreamingServices { get; set; } = new();

}
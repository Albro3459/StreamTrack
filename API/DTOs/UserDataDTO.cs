
using API.Models;

namespace API.DTOs;

public class UserDataDTO {
    public string Email { get; set; } = string.Empty;

    // public List<List> OwnedLists { get; set; } = new List<List>();

    // public List<ListShares> ListShares { get; set; } = new List<ListShares>();

    public List<GenreDTO> Genres { get; set; } = new List<GenreDTO>();

    // public List<StreamingService> StreamingServices { get; set; } = new List<StreamingService>();

}
namespace API.DTOs;


// Library Page. These are what is in the user's list
public class ContentMinimalDTO {
    public string ContentID { get; set; } = string.Empty;

    public string Title { get; set; } = string.Empty;

    public string VerticalPoster { get; set; } = string.Empty;

    public override bool Equals(object? obj) =>
        obj is ContentMinimalDTO other && ContentID == other.ContentID;

    public override int GetHashCode() =>
        ContentID.GetHashCode();

}
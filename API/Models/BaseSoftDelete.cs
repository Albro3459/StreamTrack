namespace API.Models;

public abstract class SoftDeletableEntity {
    public bool IsDeleted { get; set; } = false;
}
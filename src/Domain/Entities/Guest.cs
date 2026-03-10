namespace HotelBookingPlatform.Domain.Entities;

public class Guest : BaseAuditableEntity
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string? DocumentType { get; set; }
    public string? DocumentNumber { get; set; }
    public DateOnly? DateOfBirth { get; set; }
    public string? Nationality { get; set; }

    public ICollection<Booking> Bookings { get; set; } = new List<Booking>();

    public string FullName => $"{FirstName} {LastName}";
}

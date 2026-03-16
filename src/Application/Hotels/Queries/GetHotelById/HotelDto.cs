namespace HotelBookingPlatform.Application.Hotels.Queries.GetHotelById;

public sealed record HotelDto
{
    public int HotelId { get; init; }
    public string Name { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public string Address { get; init; } = string.Empty;
    public string City { get; init; } = string.Empty;
    public string Country { get; init; } = string.Empty;
    public string Email { get; init; } = string.Empty;
    public string PhoneNumber { get; init; } = string.Empty;
    public int StarRating { get; init; }
    public bool IsActive { get; init; }
}

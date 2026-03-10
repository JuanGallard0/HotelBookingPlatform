namespace HotelBookingPlatform.Application.Hotels.Queries.GetHotelById;

public record HotelDetailDto
{
    public int Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public string Address { get; init; } = string.Empty;
    public string City { get; init; } = string.Empty;
    public string Country { get; init; } = string.Empty;
    public string Email { get; init; } = string.Empty;
    public string PhoneNumber { get; init; } = string.Empty;
    public int StarRating { get; init; }
    public bool IsActive { get; init; }
    public IReadOnlyList<RoomTypeSummaryDto> RoomTypes { get; init; } = [];
}

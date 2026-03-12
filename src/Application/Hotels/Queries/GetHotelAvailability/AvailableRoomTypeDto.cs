namespace HotelBookingPlatform.Application.Hotels.Queries.GetHotelAvailability;

public sealed record AvailableRoomTypeDto
{
    public int RoomTypeId { get; init; }
    public string Name { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public int MaxOccupancy { get; init; }
    public int AvailableRooms { get; init; }
    public decimal PricePerNight { get; init; }
    public decimal? DiscountPercentage { get; init; }
    public decimal TotalPrice { get; init; }
    public string Currency { get; init; } = "USD";
}

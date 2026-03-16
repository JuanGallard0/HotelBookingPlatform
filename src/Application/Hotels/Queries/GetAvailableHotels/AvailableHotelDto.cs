namespace HotelBookingPlatform.Application.Hotels.Queries.GetAvailableHotels;

public sealed record AvailableHotelDto
{
    public int HotelId { get; init; }
    public string Name { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public string Address { get; init; } = string.Empty;
    public string City { get; init; } = string.Empty;
    public string Country { get; init; } = string.Empty;
    public int StarRating { get; init; }
    public int AvailableRoomTypeCount { get; init; }
    public int? TotalAvailableRooms { get; init; }
    public int MaxSupportedOccupancy { get; init; }
    public decimal PricePerNightFrom { get; init; }
    public decimal? TotalPriceFrom { get; init; }
    public decimal? DiscountPercentage { get; init; }
    public string Currency { get; init; } = "USD";
}

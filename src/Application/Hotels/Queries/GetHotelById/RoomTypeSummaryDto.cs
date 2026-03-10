namespace HotelBookingPlatform.Application.Hotels.Queries.GetHotelById;

public record RoomTypeSummaryDto
{
    public int Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public int MaxOccupancy { get; init; }
    public decimal BasePrice { get; init; }
}

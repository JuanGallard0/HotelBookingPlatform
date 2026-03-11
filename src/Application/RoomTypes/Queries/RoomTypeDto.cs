namespace HotelBookingPlatform.Application.RoomTypes.Queries;

public record RoomTypeDto
{
    public int Id { get; init; }
    public int HotelId { get; init; }
    public string Name { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public int MaxOccupancy { get; init; }
    public decimal BasePrice { get; init; }
    public bool IsActive { get; init; }
}

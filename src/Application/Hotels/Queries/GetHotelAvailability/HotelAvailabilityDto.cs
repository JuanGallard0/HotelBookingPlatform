namespace HotelBookingPlatform.Application.Hotels.Queries.GetHotelAvailability;

public sealed record HotelAvailabilityDto
{
    public int HotelId { get; init; }
    public DateOnly CheckIn { get; init; }
    public DateOnly CheckOut { get; init; }
    public int Nights { get; init; }
    public IReadOnlyList<AvailableRoomTypeDto> AvailableRoomTypes { get; init; } = [];
}

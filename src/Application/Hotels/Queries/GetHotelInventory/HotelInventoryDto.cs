namespace HotelBookingPlatform.Application.Hotels.Queries.GetHotelInventory;

public sealed record HotelInventoryDto
{
    public int HotelId { get; init; }
    public DateOnly From { get; init; }
    public DateOnly To { get; init; }
    public IReadOnlyList<RoomTypeInventoryDto> RoomTypes { get; init; } = [];
}

public sealed record RoomTypeInventoryDto
{
    public int RoomTypeId { get; init; }
    public string Name { get; init; } = string.Empty;
    public IReadOnlyList<InventoryDayDto> Days { get; init; } = [];
}

public sealed record InventoryDayDto
{
    public DateOnly Date { get; init; }
    public int TotalRooms { get; init; }
    public int AvailableRooms { get; init; }
    public int ReservedRooms { get; init; }
    public string RowVersion { get; init; } = string.Empty;
}

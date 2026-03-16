namespace HotelBookingPlatform.Domain.Entities;

public class RoomInventory : BaseAuditableEntity
{
    public int RoomTypeId { get; set; }
    public DateOnly Date { get; set; }
    public int TotalRooms { get; set; }
    public int AvailableRooms { get; set; }
    public byte[] RowVersion { get; set; } = Array.Empty<byte>();

    public RoomType RoomType { get; set; } = null!;

    public bool HasAvailability(int requestedRooms)
    {
        return AvailableRooms >= requestedRooms;
    }

    public void ReserveRooms(int numberOfRooms)
    {
        if (numberOfRooms > AvailableRooms)
        {
            throw new InsufficientInventoryException(numberOfRooms, AvailableRooms);
        }

        AvailableRooms -= numberOfRooms;
    }

    public void ReleaseRooms(int numberOfRooms)
    {
        AvailableRooms += numberOfRooms;

        if (AvailableRooms > TotalRooms)
        {
            throw new InvalidOperationException($"Available rooms cannot exceed total rooms. Total: {TotalRooms}");
        }
    }
}

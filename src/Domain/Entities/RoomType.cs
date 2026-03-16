namespace HotelBookingPlatform.Domain.Entities;

public class RoomType : BaseAuditableEntity
{
    public int HotelId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int MaxOccupancy { get; set; }
    public decimal BasePrice { get; set; }
    public bool IsActive { get; set; } = true;

    public Hotel Hotel { get; set; } = null!;
    public ICollection<RoomInventory> RoomInventories { get; set; } = new List<RoomInventory>();
    public ICollection<RatePlan> RatePlans { get; set; } = new List<RatePlan>();
}

namespace HotelBookingPlatform.Domain.Entities;

public class RatePlan : BaseAuditableEntity
{
    public int RoomTypeId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateOnly ValidFrom { get; set; }
    public DateOnly ValidTo { get; set; }
    public decimal PricePerNight { get; set; }
    public decimal? DiscountPercentage { get; set; }
    public bool IsActive { get; set; } = true;

    public RoomType RoomType { get; set; } = null!;

    public bool IsValidForDate(DateOnly date)
    {
        return IsActive && date >= ValidFrom && date <= ValidTo;
    }

    public decimal GetEffectivePrice()
    {
        if (DiscountPercentage.HasValue && DiscountPercentage > 0)
        {
            return PricePerNight * (1 - DiscountPercentage.Value / 100);
        }

        return PricePerNight;
    }

    public decimal CalculateTotalPrice(DateOnly checkIn, DateOnly checkOut)
    {
        if (checkOut <= checkIn)
        {
            throw new ArgumentException("Check-out date must be after check-in date");
        }

        int numberOfNights = checkOut.DayNumber - checkIn.DayNumber;
        return GetEffectivePrice() * numberOfNights;
    }
}

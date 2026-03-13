namespace HotelBookingPlatform.Application.Hotels.Queries.GetHotelDetails;

public sealed record HotelDetailsDto
{
    public int HotelId { get; init; }
    public string Name { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public string Address { get; init; } = string.Empty;
    public string City { get; init; } = string.Empty;
    public string Country { get; init; } = string.Empty;
    public string Email { get; init; } = string.Empty;
    public string PhoneNumber { get; init; } = string.Empty;
    public int StarRating { get; init; }
    public bool IsActive { get; init; }
    public IReadOnlyList<RoomTypeDetailsDto> RoomTypes { get; init; } = [];
}

public sealed record RoomTypeDetailsDto
{
    public int RoomTypeId { get; init; }
    public string Name { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public int MaxOccupancy { get; init; }
    public decimal BasePrice { get; init; }
    public bool IsActive { get; init; }
    public IReadOnlyList<RatePlanDetailsDto> RatePlans { get; init; } = [];
}

public sealed record RatePlanDetailsDto
{
    public int RatePlanId { get; init; }
    public string Name { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public DateOnly ValidFrom { get; init; }
    public DateOnly ValidTo { get; init; }
    public decimal PricePerNight { get; init; }
    public decimal? DiscountPercentage { get; init; }
    public bool IsActive { get; init; }
}

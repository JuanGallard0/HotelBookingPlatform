namespace HotelBookingPlatform.Infrastructure.Caching;

public sealed class AvailabilityCacheOptions
{
    public const string SectionName = "AvailabilityCache";

    public bool Enabled { get; set; } = true;
    public int TtlSeconds { get; set; } = 60;
}

namespace HotelBookingPlatform.Api.Infrastructure;

public sealed class ApiRateLimitingOptions
{
    public const string SectionName = "RateLimiting";

    public PolicySettings Auth { get; set; } = new(5, 1);
    public PolicySettings BookingWrite { get; set; } = new(10, 1);

    public sealed record PolicySettings(int PermitLimit, int WindowMinutes);
}

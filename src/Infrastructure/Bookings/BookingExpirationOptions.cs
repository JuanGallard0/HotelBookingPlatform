namespace HotelBookingPlatform.Infrastructure.Bookings;

public sealed class BookingExpirationOptions
{
    public const string SectionName = "BookingExpiration";

    public bool Enabled { get; set; } = true;
    public string CronExpression { get; set; } = "*/5 * * * *";
    public int BatchSize { get; set; } = 100;
    public string CancellationReason { get; set; } =
        "Expired automatically because the check-in date has passed.";
}

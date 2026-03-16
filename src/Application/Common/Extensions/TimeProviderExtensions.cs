namespace HotelBookingPlatform.Application.Common.Extensions;

public static class TimeProviderExtensions
{
    private static readonly TimeZoneInfo ElSalvadorZone =
        TimeZoneInfo.FindSystemTimeZoneById("America/El_Salvador");

    public static DateOnly GetElSalvadorDate(this TimeProvider timeProvider)
    {
        var local = TimeZoneInfo.ConvertTime(timeProvider.GetUtcNow(), ElSalvadorZone);
        return DateOnly.FromDateTime(local.DateTime);
    }
}

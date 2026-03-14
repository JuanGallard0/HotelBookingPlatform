using HotelBookingPlatform.Application.Bookings.Jobs;

namespace HotelBookingPlatform.Hangfire;

public sealed class ExpirePendingBookingsJob(
    IBookingExpirationService bookingExpirationService,
    ILogger<ExpirePendingBookingsJob> logger)
{
    public async Task ExecuteAsync()
    {
        var expiredCount = await bookingExpirationService.ExpirePendingBookingsAsync();

        logger.LogInformation(
            "Hangfire booking expiration run completed. Expired {ExpiredCount} bookings.",
            expiredCount);
    }
}

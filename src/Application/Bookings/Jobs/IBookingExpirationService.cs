namespace HotelBookingPlatform.Application.Bookings.Jobs;

public interface IBookingExpirationService
{
    Task<int> ExpirePendingBookingsAsync(CancellationToken cancellationToken = default);
}

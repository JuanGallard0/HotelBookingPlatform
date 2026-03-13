using HotelBookingPlatform.Application.Bookings.Queries.GetUserBookings;

namespace HotelBookingPlatform.Application.Bookings.Queries;

public interface IBookingQueryService
{
    Task<(IReadOnlyList<UserBookingDto> Bookings, int TotalCount)> GetUserBookingsAsync(
        GetUserBookingsQuery query,
        int userId,
        CancellationToken cancellationToken);
}

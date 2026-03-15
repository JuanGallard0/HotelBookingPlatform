using HotelBookingPlatform.Application.Bookings.Queries.GetBookingById;
using HotelBookingPlatform.Application.Bookings.Queries.GetUserBookings;

namespace HotelBookingPlatform.Application.Bookings.Queries;

public interface IBookingQueryService
{
    Task<(IReadOnlyList<UserBookingDto> Bookings, int TotalCount)> GetUserBookingsAsync(
        GetUserBookingsQuery query,
        int userId,
        CancellationToken cancellationToken);

    Task<BookingDetailsDto?> GetBookingByIdAsync(
        int bookingId,
        int userId,
        CancellationToken cancellationToken);
}

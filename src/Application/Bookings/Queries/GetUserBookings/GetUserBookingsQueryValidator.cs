using HotelBookingPlatform.Application.Common.Validation;

namespace HotelBookingPlatform.Application.Bookings.Queries.GetUserBookings;

public class GetUserBookingsQueryValidator : PagedSortedRequestValidator<GetUserBookingsQuery>
{
    public GetUserBookingsQueryValidator()
        : base(GetUserBookingsQuery.AllowedSortColumns)
    {
    }
}

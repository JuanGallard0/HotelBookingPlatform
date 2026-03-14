using HotelBookingPlatform.Application.Bookings.Queries;
using HotelBookingPlatform.Application.Common.Interfaces;
using HotelBookingPlatform.Application.Common.Models;

namespace HotelBookingPlatform.Application.Bookings.Queries.GetBookingById;

public sealed record GetBookingByIdQuery(int BookingId) : IRequest<Result<BookingDetailsDto>>;

public sealed class GetBookingByIdQueryHandler(
    IBookingQueryService bookingQueryService,
    ICurrentUserService currentUser)
    : IRequestHandler<GetBookingByIdQuery, Result<BookingDetailsDto>>
{
    public async Task<Result<BookingDetailsDto>> Handle(
        GetBookingByIdQuery request,
        CancellationToken cancellationToken)
    {
        if (!currentUser.IsAuthenticated || !currentUser.UserId.HasValue)
            return Result<BookingDetailsDto>.Unauthorized();

        var booking = await bookingQueryService.GetBookingByIdAsync(
            request.BookingId,
            currentUser.UserId.Value,
            cancellationToken);

        return booking is null
            ? Result<BookingDetailsDto>.NotFound("Booking not found.")
            : Result<BookingDetailsDto>.Success(booking);
    }
}

using HotelBookingPlatform.Application.Common.Interfaces;
using HotelBookingPlatform.Application.Common.Models;
using HotelBookingPlatform.Domain.Enums;

namespace HotelBookingPlatform.Application.Bookings.Queries.GetUserBookings;

public record GetUserBookingsQuery : PagedSortedRequest, IRequest<Result<PagedResponse<UserBookingDto>>>
{
    public BookingStatus? Status { get; init; }

    public static readonly IReadOnlySet<string> AllowedSortColumns =
        new HashSet<string>(StringComparer.OrdinalIgnoreCase)
        {
            "BookingId", "CheckIn", "CheckOut", "TotalAmount", "Status", "CreatedAt"
        };
}

public class GetUserBookingsQueryHandler(
    IBookingQueryService bookingQueryService,
    ICurrentUserService currentUser)
    : IRequestHandler<GetUserBookingsQuery, Result<PagedResponse<UserBookingDto>>>
{
    public async Task<Result<PagedResponse<UserBookingDto>>> Handle(
        GetUserBookingsQuery request,
        CancellationToken cancellationToken)
    {
        if (!currentUser.IsAuthenticated || !currentUser.UserId.HasValue)
            return Result<PagedResponse<UserBookingDto>>.Unauthorized();

        var (bookings, totalCount) = await bookingQueryService.GetUserBookingsAsync(
            request,
            currentUser.UserId.Value,
            cancellationToken);

        return Result<PagedResponse<UserBookingDto>>.Success(
            new PagedResponse<UserBookingDto>(bookings, request.ResolvedPageNumber, request.ResolvedPageSize, totalCount));
    }
}

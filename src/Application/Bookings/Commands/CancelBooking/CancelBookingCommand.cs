using HotelBookingPlatform.Application.Common.Interfaces;
using HotelBookingPlatform.Application.Common.Models;
using HotelBookingPlatform.Domain.Exceptions;

namespace HotelBookingPlatform.Application.Bookings.Commands.CancelBooking;

public record CancelBookingCommand(int BookingId, string Reason) : IRequest<Result>;

public class CancelBookingCommandHandler(
    IApplicationDbContext context,
    IUnitOfWork unitOfWork,
    ICurrentUserService currentUser)
    : IRequestHandler<CancelBookingCommand, Result>
{
    public async Task<Result> Handle(CancelBookingCommand request, CancellationToken cancellationToken)
    {
        if (!currentUser.IsAuthenticated || !currentUser.UserId.HasValue)
            return Result.Unauthorized();

        var booking = await context.Bookings
            .FirstOrDefaultAsync(b => b.Id == request.BookingId, cancellationToken);

        if (booking is null)

            return Result.NotFound($"Booking with id {request.BookingId} was not found.");

        if (booking.UserId != currentUser.UserId.Value)
            return Result.Forbidden();

        try
        {
            booking.Cancel(request.Reason);
        }
        catch (BookingStatusException ex)
        {
            return Result.UnprocessableEntity(ex.Message);
        }

        await unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}

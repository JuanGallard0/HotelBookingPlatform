using HotelBookingPlatform.Application.Common.Interfaces;
using HotelBookingPlatform.Application.Common.Models;
using HotelBookingPlatform.Domain.Exceptions;

namespace HotelBookingPlatform.Application.Bookings.Commands.ConfirmBooking;

public record ConfirmBookingCommand(int BookingId) : IRequest<Result>;

public class ConfirmBookingCommandHandler(
    IApplicationDbContext context,
    IUnitOfWork unitOfWork,
    ICurrentUserService currentUser)
    : IRequestHandler<ConfirmBookingCommand, Result>
{
    public async Task<Result> Handle(ConfirmBookingCommand request, CancellationToken cancellationToken)
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
            booking.Confirm();
        }
        catch (BookingStatusException ex)
        {
            return Result.UnprocessableEntity(ex.Message);
        }

        await unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}

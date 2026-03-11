using HotelBookingPlatform.Application.Common.Interfaces;
using HotelBookingPlatform.Application.Common.Models;

namespace HotelBookingPlatform.Application.Hotels.Commands.DeleteHotel;

public class DeleteHotelCommandHandler(
    IApplicationDbContext context,
    IUnitOfWork unitOfWork)
    : IRequestHandler<DeleteHotelCommand, Result>
{
    public async Task<Result> Handle(DeleteHotelCommand request, CancellationToken cancellationToken)
    {
        var hotel = await context.Hotels
            .FirstOrDefaultAsync(h => h.Id == request.Id, cancellationToken);

        if (hotel is null)
            return Result.NotFound($"Hotel with id {request.Id} was not found.");

        var hasActiveBookings = await context.Bookings
            .AnyAsync(b => b.RoomType.HotelId == request.Id && b.Status != Domain.Enums.BookingStatus.Cancelled, cancellationToken);

        if (hasActiveBookings)
            return Result.Conflict("Cannot delete a hotel that has active bookings.");

        context.Hotels.Remove(hotel);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}

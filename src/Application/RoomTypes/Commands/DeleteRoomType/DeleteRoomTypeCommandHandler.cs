using HotelBookingPlatform.Application.Common.Interfaces;
using HotelBookingPlatform.Application.Common.Models;
using HotelBookingPlatform.Domain.Enums;

namespace HotelBookingPlatform.Application.RoomTypes.Commands.DeleteRoomType;

public class DeleteRoomTypeCommandHandler(
    IApplicationDbContext context,
    IUnitOfWork unitOfWork)
    : IRequestHandler<DeleteRoomTypeCommand, Result>
{
    public async Task<Result> Handle(DeleteRoomTypeCommand request, CancellationToken cancellationToken)
    {
        var roomType = await context.RoomTypes
            .FirstOrDefaultAsync(rt => rt.Id == request.Id && rt.HotelId == request.HotelId, cancellationToken);

        if (roomType is null)
            return Result.NotFound($"Room type with id {request.Id} was not found in hotel {request.HotelId}.");

        var hasActiveBookings = await context.Bookings
            .AnyAsync(b => b.RoomTypeId == request.Id && b.Status != BookingStatus.Cancelled, cancellationToken);

        if (hasActiveBookings)
            return Result.Conflict("Cannot delete a room type that has active bookings.");

        context.RoomTypes.Remove(roomType);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}

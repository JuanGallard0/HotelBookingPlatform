using HotelBookingPlatform.Application.Common.Interfaces;
using HotelBookingPlatform.Application.Common.Models;
using HotelBookingPlatform.Domain.Enums;

namespace HotelBookingPlatform.Application.Hotels.Commands.DeleteRoomType;

public record DeleteRoomTypeCommand(int RoomTypeId) : IRequest<Result>;

public class DeleteRoomTypeCommandHandler(
    IApplicationDbContext context,
    IUnitOfWork unitOfWork)
    : IRequestHandler<DeleteRoomTypeCommand, Result>
{
    public async Task<Result> Handle(DeleteRoomTypeCommand request, CancellationToken cancellationToken)
    {
        var roomType = await context.RoomTypes
            .FirstOrDefaultAsync(rt => rt.Id == request.RoomTypeId, cancellationToken);

        if (roomType is null)
            return Result.NotFound($"Room type with id {request.RoomTypeId} was not found.");

        var hasActiveBookings = await context.Bookings
            .AnyAsync(b => b.RoomTypeId == request.RoomTypeId && b.Status != BookingStatus.Cancelled, cancellationToken);

        if (hasActiveBookings)
            return Result.Conflict("Cannot delete a room type that has active bookings.");

        context.RoomTypes.Remove(roomType);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}

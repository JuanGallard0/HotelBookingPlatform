using HotelBookingPlatform.Application.Common.Interfaces;
using HotelBookingPlatform.Application.Common.Models;

namespace HotelBookingPlatform.Application.RoomTypes.Commands.UpdateRoomType;

public class UpdateRoomTypeCommandHandler(
    IApplicationDbContext context,
    IUnitOfWork unitOfWork)
    : IRequestHandler<UpdateRoomTypeCommand, Result>
{
    public async Task<Result> Handle(UpdateRoomTypeCommand request, CancellationToken cancellationToken)
    {
        var roomType = await context.RoomTypes
            .FirstOrDefaultAsync(rt => rt.Id == request.Id && rt.HotelId == request.HotelId, cancellationToken);

        if (roomType is null)
            return Result.NotFound($"Room type with id {request.Id} was not found in hotel {request.HotelId}.");

        roomType.Name         = request.Name.Trim();
        roomType.Description  = request.Description.Trim();
        roomType.MaxOccupancy = request.MaxOccupancy;
        roomType.BasePrice    = request.BasePrice;
        roomType.IsActive     = request.IsActive;

        await unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}

using System.Text.Json.Serialization;
using HotelBookingPlatform.Application.Common.Interfaces;
using HotelBookingPlatform.Application.Common.Models;

namespace HotelBookingPlatform.Application.Hotels.Commands.UpdateRoomType;

public record UpdateRoomTypeCommand(
    string Name,
    string Description,
    int MaxOccupancy,
    decimal BasePrice,
    bool IsActive) : IRequest<Result>
{
    [JsonIgnore]
    public int RoomTypeId { get; init; }
}

public class UpdateRoomTypeCommandHandler(
    IApplicationDbContext context,
    IUnitOfWork unitOfWork)
    : IRequestHandler<UpdateRoomTypeCommand, Result>
{
    public async Task<Result> Handle(UpdateRoomTypeCommand request, CancellationToken cancellationToken)
    {
        var roomType = await context.RoomTypes
            .FirstOrDefaultAsync(rt => rt.Id == request.RoomTypeId, cancellationToken);

        if (roomType is null)
            return Result.NotFound($"Room type with id {request.RoomTypeId} was not found.");

        roomType.Name = request.Name.Trim();
        roomType.Description = request.Description.Trim();
        roomType.MaxOccupancy = request.MaxOccupancy;
        roomType.BasePrice = request.BasePrice;
        roomType.IsActive = request.IsActive;

        await unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}

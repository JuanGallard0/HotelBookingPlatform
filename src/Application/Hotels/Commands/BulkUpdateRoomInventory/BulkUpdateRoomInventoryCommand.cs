using System.Text.Json.Serialization;
using HotelBookingPlatform.Application.Common.Interfaces;
using HotelBookingPlatform.Application.Common.Models;
using HotelBookingPlatform.Domain.Entities;

namespace HotelBookingPlatform.Application.Hotels.Commands.BulkUpdateRoomInventory;

public record BulkUpdateRoomInventoryCommand(
    DateOnly From,
    DateOnly To,
    int TotalRooms,
    int AvailableRooms) : IRequest<Result>
{
    [JsonIgnore]
    public int RoomTypeId { get; init; }
}

public class BulkUpdateRoomInventoryCommandHandler(
    IApplicationDbContext context,
    IUnitOfWork unitOfWork)
    : IRequestHandler<BulkUpdateRoomInventoryCommand, Result>
{
    public async Task<Result> Handle(BulkUpdateRoomInventoryCommand request, CancellationToken cancellationToken)
    {
        var roomTypeExists = await context.RoomTypes
            .AnyAsync(rt => rt.Id == request.RoomTypeId, cancellationToken);

        if (!roomTypeExists)
            return Result.NotFound($"Room type with id {request.RoomTypeId} was not found.");

        var existingInventories = await context.RoomInventories
            .Where(ri => ri.RoomTypeId == request.RoomTypeId && ri.Date >= request.From && ri.Date <= request.To)
            .ToDictionaryAsync(ri => ri.Date, cancellationToken);

        for (var date = request.From; date <= request.To; date = date.AddDays(1))
        {
            if (existingInventories.TryGetValue(date, out var inventory))
            {
                inventory.TotalRooms = request.TotalRooms;
                inventory.AvailableRooms = request.AvailableRooms;
                continue;
            }

            context.RoomInventories.Add(new RoomInventory
            {
                RoomTypeId = request.RoomTypeId,
                Date = date,
                TotalRooms = request.TotalRooms,
                AvailableRooms = request.AvailableRooms
            });
        }

        await unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}

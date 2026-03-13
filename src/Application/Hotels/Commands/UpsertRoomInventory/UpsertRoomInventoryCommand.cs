using System.Text.Json.Serialization;
using HotelBookingPlatform.Application.Common.Interfaces;
using HotelBookingPlatform.Application.Common.Models;
using HotelBookingPlatform.Domain.Entities;
using Microsoft.EntityFrameworkCore.ChangeTracking;

namespace HotelBookingPlatform.Application.Hotels.Commands.UpsertRoomInventory;

public record UpsertRoomInventoryCommand(
    int TotalRooms,
    int AvailableRooms,
    string? RowVersion) : IRequest<Result>
{
    [JsonIgnore]
    public int RoomTypeId { get; init; }

    [JsonIgnore]
    public DateOnly Date { get; init; }
}

public class UpsertRoomInventoryCommandHandler(
    IApplicationDbContext context,
    IUnitOfWork unitOfWork)
    : IRequestHandler<UpsertRoomInventoryCommand, Result>
{
    public async Task<Result> Handle(UpsertRoomInventoryCommand request, CancellationToken cancellationToken)
    {
        var roomTypeExists = await context.RoomTypes
            .AnyAsync(rt => rt.Id == request.RoomTypeId, cancellationToken);

        if (!roomTypeExists)
            return Result.NotFound($"Room type with id {request.RoomTypeId} was not found.");

        var inventory = await context.RoomInventories
            .FirstOrDefaultAsync(
                ri => ri.RoomTypeId == request.RoomTypeId && ri.Date == request.Date,
                cancellationToken);

        if (inventory is null)
        {
            context.RoomInventories.Add(new RoomInventory
            {
                RoomTypeId = request.RoomTypeId,
                Date = request.Date,
                TotalRooms = request.TotalRooms,
                AvailableRooms = request.AvailableRooms
            });
        }
        else
        {
            var concurrencyResult = TryApplyConcurrencyToken(request.RowVersion, context.RoomInventories.Entry(inventory));
            if (concurrencyResult is not null)
                return concurrencyResult;

            inventory.TotalRooms = request.TotalRooms;
            inventory.AvailableRooms = request.AvailableRooms;
        }

        try
        {
            await unitOfWork.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateConcurrencyException)
        {
            return Result.Conflict("Inventory was updated by another request. Refresh and try again.");
        }

        return Result.Success();
    }

    private static Result? TryApplyConcurrencyToken(string? rowVersion, EntityEntry<RoomInventory> entry)
    {
        if (string.IsNullOrWhiteSpace(rowVersion))
            return null;

        try
        {
            entry.Property(x => x.RowVersion).OriginalValue = Convert.FromBase64String(rowVersion);
            return null;
        }
        catch (FormatException)
        {
            return Result.Failure("RowVersion must be a valid base64 string.");
        }
    }
}

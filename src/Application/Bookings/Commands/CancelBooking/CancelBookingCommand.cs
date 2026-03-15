using System.Diagnostics;
using System.Text.Json;
using HotelBookingPlatform.Application.Common.Interfaces;
using HotelBookingPlatform.Application.Common.Models;
using HotelBookingPlatform.Domain.Entities;
using HotelBookingPlatform.Domain.Exceptions;

namespace HotelBookingPlatform.Application.Bookings.Commands.CancelBooking;

public record CancelBookingCommand(int BookingId, string Reason) : IRequest<Result>;

public class CancelBookingCommandHandler(
    IApplicationDbContext context,
    IUnitOfWork unitOfWork,
    IAuditLogService auditLogService,
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

        var previousStatus = booking.Status;

        try
        {
            booking.Cancel(request.Reason);
        }
        catch (BookingStatusException ex)
        {
            return Result.UnprocessableEntity(ex.Message);
        }

        var inventories = await context.RoomInventories
            .Where(ri => ri.RoomTypeId == booking.RoomTypeId
                      && ri.Date >= booking.CheckInDate
                      && ri.Date < booking.CheckOutDate)
            .ToListAsync(cancellationToken);

        foreach (var inventory in inventories)
            inventory.ReleaseRooms(booking.NumberOfRooms);

        auditLogService.Add(new AuditLogEntry(
            nameof(Booking),
            booking.Id,
            "BookingCancelled",
            OldValues: Serialize(new
            {
                Status = previousStatus
            }),
            NewValues: Serialize(new
            {
                booking.Status,
                booking.CancelledAt,
                booking.CancellationReason
            }),
            AdditionalInfo: Serialize(new
            {
                booking.BookingNumber,
                TraceId = Activity.Current?.TraceId.ToString(),
                currentUser.Email
            })));

        await unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }

    private static string Serialize(object value) => JsonSerializer.Serialize(value);
}

using HotelBookingPlatform.Application.Common.Interfaces;
using HotelBookingPlatform.Domain.Events;
using Microsoft.Extensions.Logging;

namespace HotelBookingPlatform.Application.Bookings.EventHandlers;

public class BookingCancelledEventHandler(
    IApplicationDbContext context,
    ILogger<BookingCancelledEventHandler> logger)
    : INotificationHandler<BookingCancelledEvent>
{
    public async Task Handle(BookingCancelledEvent notification, CancellationToken cancellationToken)
    {
        var booking = notification.Booking;

        logger.LogInformation(
            "Handling booking cancellation for BookingId {BookingId} ({BookingNumber})",
            booking.Id,
            booking.BookingNumber);

        var inventories = await context.RoomInventories
            .Where(ri => ri.RoomTypeId == booking.RoomTypeId
                      && ri.Date >= booking.CheckInDate
                      && ri.Date < booking.CheckOutDate)
            .ToListAsync(cancellationToken);

        foreach (var inventory in inventories)
            inventory.ReleaseRooms(booking.NumberOfRooms);

        logger.LogInformation(
            "Released {RoomCount} room(s) across {InventoryCount} inventory record(s) for cancelled booking {BookingId}",
            booking.NumberOfRooms,
            inventories.Count,
            booking.Id);
    }
}

using HotelBookingPlatform.Application.Common.Interfaces;
using HotelBookingPlatform.Domain.Events;

namespace HotelBookingPlatform.Application.Bookings.EventHandlers;

public class BookingCancelledEventHandler(IApplicationDbContext context)
    : INotificationHandler<BookingCancelledEvent>
{
    public async Task Handle(BookingCancelledEvent notification, CancellationToken cancellationToken)
    {
        var booking = notification.Booking;

        var inventories = await context.RoomInventories
            .Where(ri => ri.RoomTypeId == booking.RoomTypeId
                      && ri.Date >= booking.CheckInDate
                      && ri.Date < booking.CheckOutDate)
            .ToListAsync(cancellationToken);

        foreach (var inventory in inventories)
            inventory.ReleaseRooms(booking.NumberOfRooms);
    }
}

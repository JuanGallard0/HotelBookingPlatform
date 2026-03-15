using HotelBookingPlatform.Domain.Events;
using Microsoft.Extensions.Logging;

namespace HotelBookingPlatform.Application.Bookings.EventHandlers;

public class BookingCancelledEventHandler(
    ILogger<BookingCancelledEventHandler> logger)
    : INotificationHandler<BookingCancelledEvent>
{
    public Task Handle(BookingCancelledEvent notification, CancellationToken cancellationToken)
    {
        var booking = notification.Booking;

        logger.LogInformation(
            "Booking {BookingId} ({BookingNumber}) was cancelled",
            booking.Id,
            booking.BookingNumber);

        return Task.CompletedTask;
    }
}

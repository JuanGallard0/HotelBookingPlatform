using HotelBookingPlatform.Domain.Events;
using Microsoft.Extensions.Logging;

namespace HotelBookingPlatform.Application.Bookings.EventHandlers;

public class BookingConfirmedEventHandler(
    ILogger<BookingConfirmedEventHandler> logger)
    : INotificationHandler<BookingConfirmedEvent>
{
    public Task Handle(BookingConfirmedEvent notification, CancellationToken cancellationToken)
    {
        var booking = notification.Booking;

        logger.LogInformation(
            "Handled booking confirmation for BookingId {BookingId} ({BookingNumber}) at {ConfirmedAt}",
            booking.Id,
            booking.BookingNumber,
            booking.ConfirmedAt);

        return Task.CompletedTask;
    }
}

using HotelBookingPlatform.Domain.Events;
using Microsoft.Extensions.Logging;

namespace HotelBookingPlatform.Application.Bookings.EventHandlers;

public class BookingCreatedEventHandler(
    ILogger<BookingCreatedEventHandler> logger)
    : INotificationHandler<BookingCreatedEvent>
{
    public Task Handle(BookingCreatedEvent notification, CancellationToken cancellationToken)
    {
        var booking = notification.Booking;

        logger.LogInformation(
            "Handled booking creation for BookingId {BookingId} ({BookingNumber}) with status {Status}",
            booking.Id,
            booking.BookingNumber,
            booking.Status);

        return Task.CompletedTask;
    }
}

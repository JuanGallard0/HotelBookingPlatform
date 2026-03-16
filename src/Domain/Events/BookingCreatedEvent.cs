namespace HotelBookingPlatform.Domain.Events;

public class BookingCreatedEvent : BaseEvent
{
    public BookingCreatedEvent(Booking booking)
    {
        Booking = booking;
    }

    public Booking Booking { get; }
}

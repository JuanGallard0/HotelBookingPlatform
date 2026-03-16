namespace HotelBookingPlatform.Domain.Events;

public class BookingCancelledEvent : BaseEvent
{
    public BookingCancelledEvent(Booking booking)
    {
        Booking = booking;
    }

    public Booking Booking { get; }
}

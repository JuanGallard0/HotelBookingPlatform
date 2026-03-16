namespace HotelBookingPlatform.Domain.Events;

public class BookingConfirmedEvent : BaseEvent
{
    public BookingConfirmedEvent(Booking booking)
    {
        Booking = booking;
    }

    public Booking Booking { get; }
}

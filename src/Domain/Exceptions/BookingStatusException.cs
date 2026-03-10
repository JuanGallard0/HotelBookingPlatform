namespace HotelBookingPlatform.Domain.Exceptions;

public class BookingStatusException : Exception
{
    public BookingStatusException(string operation, string currentStatus)
        : base($"Cannot {operation} a booking with status '{currentStatus}'.")
    {
    }

    public BookingStatusException(string message) : base(message)
    {
    }
}

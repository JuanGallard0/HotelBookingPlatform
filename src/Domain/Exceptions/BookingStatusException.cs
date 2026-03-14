namespace HotelBookingPlatform.Domain.Exceptions;

public class BookingStatusException : Exception
{
    public BookingStatusException(string operation, string currentStatus)
        : base($"No se puede {operation} una reserva con estado '{currentStatus}'.")
    {
    }

    public BookingStatusException(string message) : base(message)
    {
    }
}

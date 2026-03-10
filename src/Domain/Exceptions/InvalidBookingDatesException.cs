namespace HotelBookingPlatform.Domain.Exceptions;

public class InvalidBookingDatesException : Exception
{
    public InvalidBookingDatesException(string message) : base(message)
    {
    }
}

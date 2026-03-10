namespace HotelBookingPlatform.Domain.Exceptions;

public class InsufficientInventoryException : Exception
{
    public InsufficientInventoryException(int requested, int available)
        : base($"Insufficient room inventory. Requested: {requested}, Available: {available}.")
    {
    }
}

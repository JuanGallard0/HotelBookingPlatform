using HotelBookingPlatform.Domain.Enums;

namespace HotelBookingPlatform.Application.Bookings.Commands.CreateBooking;

public sealed record BookingDto
{
    public int BookingId { get; init; }
    public string BookingNumber { get; init; } = string.Empty;
    public string RoomTypeName { get; init; } = string.Empty;
    public BookingStatus Status { get; init; }
    public DateOnly CheckIn { get; init; }
    public DateOnly CheckOut { get; init; }
    public int Nights { get; init; }
    public int NumberOfRooms { get; init; }
    public int NumberOfGuests { get; init; }
    public decimal TotalAmount { get; init; }
    public string Currency { get; init; } = "USD";
    public string? SpecialRequests { get; init; }
}

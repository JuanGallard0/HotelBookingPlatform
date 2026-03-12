using HotelBookingPlatform.Application.Common.Models;

namespace HotelBookingPlatform.Application.Bookings.Commands.CreateBooking;

public record CreateBookingCommand : IRequest<Result<BookingDto>>
{
    public string? IdempotencyKey { get; init; }
    public int RoomTypeId { get; init; }
    public DateOnly CheckIn { get; init; }
    public DateOnly CheckOut { get; init; }
    public int NumberOfGuests { get; init; }
    public int NumberOfRooms { get; init; }
    public GuestInfoDto Guest { get; init; } = null!;
    public string? SpecialRequests { get; init; }
}

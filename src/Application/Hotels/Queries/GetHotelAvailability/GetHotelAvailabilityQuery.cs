using HotelBookingPlatform.Application.Common.Models;

namespace HotelBookingPlatform.Application.Hotels.Queries.GetHotelAvailability;

public record GetHotelAvailabilityQuery : IRequest<Result<HotelAvailabilityDto>>
{
    public int HotelId { get; init; }
    public DateOnly? CheckIn { get; init; }
    public DateOnly? CheckOut { get; init; }
    public int? NumberOfGuests { get; init; }
}

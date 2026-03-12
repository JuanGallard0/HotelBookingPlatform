using HotelBookingPlatform.Application.Hotels.Queries.GetAvailableHotels;
using HotelBookingPlatform.Application.Hotels.Queries.GetHotelAvailability;

namespace HotelBookingPlatform.Application.Hotels.Queries;

public interface IHotelQueryService
{
    Task<(IReadOnlyList<AvailableHotelDto> Hotels, int TotalCount)> GetAvailableHotelsAsync(
        GetAvailableHotelsQuery query,
        CancellationToken cancellationToken);

    Task<IReadOnlyList<AvailableRoomTypeDto>> GetHotelAvailabilityAsync(
        GetHotelAvailabilityQuery query,
        CancellationToken cancellationToken);
}

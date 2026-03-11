using HotelBookingPlatform.Application.Hotels.Queries.GetAvailableHotels;

namespace HotelBookingPlatform.Application.Hotels.Queries;

public interface IHotelQueryService
{
    Task<(IReadOnlyList<AvailableHotelDto> Hotels, int TotalCount)> GetAvailableHotelsAsync(
        GetAvailableHotelsQuery query,
        CancellationToken cancellationToken);
}

using HotelBookingPlatform.Application.Hotels.Queries.GetHotelById;
using HotelBookingPlatform.Application.Hotels.Queries.GetHotels;

namespace HotelBookingPlatform.Application.Hotels.Queries;

public interface IHotelQueryService
{
    Task<HotelQueryResult> GetHotelsAsync(
        GetHotelsQuery query,
        CancellationToken cancellationToken);

    Task<HotelDetailDto?> GetHotelByIdAsync(
        int id,
        CancellationToken cancellationToken);
}

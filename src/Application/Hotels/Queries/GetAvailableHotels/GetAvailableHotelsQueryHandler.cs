using HotelBookingPlatform.Application.Common.Models;

namespace HotelBookingPlatform.Application.Hotels.Queries.GetAvailableHotels;

public class GetAvailableHotelsQueryHandler(IHotelQueryService hotelQueryService)
    : IRequestHandler<GetAvailableHotelsQuery, Result<PagedResponse<AvailableHotelDto>>>
{
    public async Task<Result<PagedResponse<AvailableHotelDto>>> Handle(
        GetAvailableHotelsQuery request,
        CancellationToken cancellationToken)
    {
        var (hotels, totalCount) = await hotelQueryService.GetAvailableHotelsAsync(request, cancellationToken);

        var response = new PagedResponse<AvailableHotelDto>(
            hotels,
            request.ResolvedPageNumber,
            request.ResolvedPageSize,
            totalCount);

        return Result<PagedResponse<AvailableHotelDto>>.Success(response);
    }
}

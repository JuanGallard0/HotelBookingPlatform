using HotelBookingPlatform.Application.Common.Models;

namespace HotelBookingPlatform.Application.Hotels.Queries.GetHotels;

public class GetHotelsQueryHandler(IHotelQueryService hotelQueryService) : IRequestHandler<GetHotelsQuery, Result<PagedResponse<HotelDto>>>
{
    public async Task<Result<PagedResponse<HotelDto>>> Handle(
        GetHotelsQuery request,
        CancellationToken cancellationToken)
    {
        var queryResult = await hotelQueryService.GetHotelsAsync(request, cancellationToken);

        var response = new PagedResponse<HotelDto>(
            queryResult.Hotels,
            request.ResolvedPageNumber,
            request.ResolvedPageSize,
            queryResult.TotalCount);

        return Result<PagedResponse<HotelDto>>.Success(response);
    }
}

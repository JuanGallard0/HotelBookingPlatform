using HotelBookingPlatform.Application.Common.Models;
using HotelBookingPlatform.Application.Hotels.Queries;

namespace HotelBookingPlatform.Application.Hotels.Queries.GetHotels;

public class GetHotelsQueryHandler : IRequestHandler<GetHotelsQuery, Result<PagedResponse<HotelDto>>>
{
    private readonly IHotelQueryService _hotelQueryService;

    public GetHotelsQueryHandler(IHotelQueryService hotelQueryService)
    {
        _hotelQueryService = hotelQueryService;
    }

    public async Task<Result<PagedResponse<HotelDto>>> Handle(
        GetHotelsQuery request,
        CancellationToken cancellationToken)
    {
        var queryResult = await _hotelQueryService.GetHotelsAsync(request, cancellationToken);

        var response = new PagedResponse<HotelDto>(
            queryResult.Hotels,
            request.ResolvedPageNumber,
            request.ResolvedPageSize,
            queryResult.TotalCount);

        return Result<PagedResponse<HotelDto>>.Success(response);
    }
}

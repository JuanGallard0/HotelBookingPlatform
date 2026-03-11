using HotelBookingPlatform.Application.Common.Models;

namespace HotelBookingPlatform.Application.RoomTypes.Queries.GetRoomTypes;

public class GetRoomTypesQueryHandler(IRoomTypeQueryService roomTypeQueryService)
    : IRequestHandler<GetRoomTypesQuery, Result<PagedResponse<RoomTypeDto>>>
{
    public async Task<Result<PagedResponse<RoomTypeDto>>> Handle(
        GetRoomTypesQuery request,
        CancellationToken cancellationToken)
    {
        var queryResult = await roomTypeQueryService.GetRoomTypesAsync(request, cancellationToken);

        var response = new PagedResponse<RoomTypeDto>(
            queryResult.RoomTypes,
            request.ResolvedPageNumber,
            request.ResolvedPageSize,
            queryResult.TotalCount);

        return Result<PagedResponse<RoomTypeDto>>.Success(response);
    }
}

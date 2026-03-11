using HotelBookingPlatform.Application.Common.Models;

namespace HotelBookingPlatform.Application.RoomTypes.Queries.GetRoomTypeById;

public class GetRoomTypeByIdQueryHandler(IRoomTypeQueryService roomTypeQueryService)
    : IRequestHandler<GetRoomTypeByIdQuery, Result<RoomTypeDto>>
{
    public async Task<Result<RoomTypeDto>> Handle(
        GetRoomTypeByIdQuery request,
        CancellationToken cancellationToken)
    {
        var roomType = await roomTypeQueryService.GetRoomTypeByIdAsync(
            request.HotelId, request.Id, cancellationToken);

        if (roomType is null)
            return Result<RoomTypeDto>.NotFound(
                $"Room type with id {request.Id} was not found in hotel {request.HotelId}.");

        return Result<RoomTypeDto>.Success(roomType);
    }
}

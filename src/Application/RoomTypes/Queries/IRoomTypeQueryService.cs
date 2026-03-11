using HotelBookingPlatform.Application.RoomTypes.Queries.GetRoomTypes;

namespace HotelBookingPlatform.Application.RoomTypes.Queries;

public interface IRoomTypeQueryService
{
    Task<RoomTypeQueryResult> GetRoomTypesAsync(
        GetRoomTypesQuery query,
        CancellationToken cancellationToken);

    Task<RoomTypeDto?> GetRoomTypeByIdAsync(
        int hotelId,
        int id,
        CancellationToken cancellationToken);
}

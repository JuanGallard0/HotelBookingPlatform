namespace HotelBookingPlatform.Application.RoomTypes.Queries.GetRoomTypes;

public record RoomTypeQueryResult(IReadOnlyList<RoomTypeDto> RoomTypes, int TotalCount);

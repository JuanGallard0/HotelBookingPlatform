namespace HotelBookingPlatform.Application.RoomTypes.Queries.GetRoomTypes;

public readonly record struct RoomTypeQueryResult(IReadOnlyList<RoomTypeDto> RoomTypes, int TotalCount);

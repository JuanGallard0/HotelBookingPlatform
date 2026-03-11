using HotelBookingPlatform.Application.Common.Models;

namespace HotelBookingPlatform.Application.RoomTypes.Queries.GetRoomTypeById;

public record GetRoomTypeByIdQuery(int HotelId, int Id) : IRequest<Result<RoomTypeDto>>;

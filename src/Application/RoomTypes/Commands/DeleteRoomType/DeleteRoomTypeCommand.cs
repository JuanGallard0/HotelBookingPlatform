using HotelBookingPlatform.Application.Common.Models;

namespace HotelBookingPlatform.Application.RoomTypes.Commands.DeleteRoomType;

public record DeleteRoomTypeCommand(int HotelId, int Id) : IRequest<Result>;

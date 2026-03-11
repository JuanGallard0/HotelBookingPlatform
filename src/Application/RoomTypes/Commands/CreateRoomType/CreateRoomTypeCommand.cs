using HotelBookingPlatform.Application.Common.Models;

namespace HotelBookingPlatform.Application.RoomTypes.Commands.CreateRoomType;

public record CreateRoomTypeCommand(
    int HotelId,
    string Name,
    string Description,
    int MaxOccupancy,
    decimal BasePrice) : IRequest<Result<int>>;

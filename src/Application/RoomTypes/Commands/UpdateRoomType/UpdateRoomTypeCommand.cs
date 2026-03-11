using HotelBookingPlatform.Application.Common.Models;

namespace HotelBookingPlatform.Application.RoomTypes.Commands.UpdateRoomType;

public record UpdateRoomTypeCommand(
    int HotelId,
    int Id,
    string Name,
    string Description,
    int MaxOccupancy,
    decimal BasePrice,
    bool IsActive) : IRequest<Result>;

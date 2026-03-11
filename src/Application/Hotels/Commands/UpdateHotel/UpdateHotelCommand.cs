using HotelBookingPlatform.Application.Common.Models;

namespace HotelBookingPlatform.Application.Hotels.Commands.UpdateHotel;

public record UpdateHotelCommand(
    int Id,
    string Name,
    string Description,
    string Address,
    string City,
    string Country,
    string Email,
    string PhoneNumber,
    int StarRating,
    bool IsActive) : IRequest<Result>;

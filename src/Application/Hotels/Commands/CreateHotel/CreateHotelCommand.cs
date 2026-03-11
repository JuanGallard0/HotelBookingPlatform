using HotelBookingPlatform.Application.Common.Models;

namespace HotelBookingPlatform.Application.Hotels.Commands.CreateHotel;

public record CreateHotelCommand(
    string Name,
    string Description,
    string Address,
    string City,
    string Country,
    string Email,
    string PhoneNumber,
    int StarRating) : IRequest<Result<int>>;

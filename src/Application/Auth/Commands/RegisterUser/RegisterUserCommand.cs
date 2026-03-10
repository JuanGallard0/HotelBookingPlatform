using HotelBookingPlatform.Application.Auth.Common;
using HotelBookingPlatform.Application.Common.Models;

namespace HotelBookingPlatform.Application.Auth.Commands.RegisterUser;

public record RegisterUserCommand(
    string Email,
    string FirstName,
    string LastName,
    string Password) : IRequest<Result<AuthResponseDto>>;

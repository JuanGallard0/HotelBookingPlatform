using HotelBookingPlatform.Application.Auth.Common;
using HotelBookingPlatform.Application.Common.Models;

namespace HotelBookingPlatform.Application.Auth.Commands.LoginUser;

public record LoginUserCommand(string Email, string Password) : IRequest<Result<AuthResponseDto>>;

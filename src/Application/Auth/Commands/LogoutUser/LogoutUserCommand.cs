using HotelBookingPlatform.Application.Common.Models;

namespace HotelBookingPlatform.Application.Auth.Commands.LogoutUser;

public record LogoutUserCommand(string RefreshToken) : IRequest<Result>;

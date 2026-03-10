using HotelBookingPlatform.Application.Auth.Common;
using HotelBookingPlatform.Application.Common.Models;

namespace HotelBookingPlatform.Application.Auth.Commands.RefreshAccessToken;

public record RefreshAccessTokenCommand(string RefreshToken) : IRequest<Result<AuthResponseDto>>;

using HotelBookingPlatform.Domain.Entities;

namespace HotelBookingPlatform.Application.Common.Interfaces;

public interface ITokenService
{
    AccessTokenResult CreateAccessToken(User user);
    RefreshTokenResult CreateRefreshToken();
    string ComputeRefreshTokenHash(string token);
}

public sealed record AccessTokenResult(string Token, DateTimeOffset ExpiresAt);

public sealed record RefreshTokenResult(string Token, string TokenHash, DateTimeOffset ExpiresAt);

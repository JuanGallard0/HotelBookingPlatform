using HotelBookingPlatform.Application.Common.Interfaces;
using HotelBookingPlatform.Domain.Entities;

namespace HotelBookingPlatform.Application.Auth.Common;

internal static class AuthMappings
{
    public static AuthenticatedUserDto ToDto(this User user) => new()
    {
        Id = user.Id,
        Email = user.Email,
        FirstName = user.FirstName,
        LastName = user.LastName,
        FullName = user.FullName,
        Role = user.Role.ToString()
    };

    public static AuthResponseDto ToAuthResponse(this User user, AccessTokenResult accessToken, RefreshTokenResult refreshToken) => new()
    {
        AccessToken = accessToken.Token,
        RefreshToken = refreshToken.Token,
        AccessTokenExpiresAt = accessToken.ExpiresAt,
        User = user.ToDto()
    };
}

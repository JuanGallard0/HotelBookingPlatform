namespace HotelBookingPlatform.Application.Auth.Common;

public record AuthResponseDto
{
    public string AccessToken { get; init; } = string.Empty;
    public string RefreshToken { get; init; } = string.Empty;
    public DateTimeOffset AccessTokenExpiresAt { get; init; }
    public AuthenticatedUserDto User { get; init; } = new();
}

namespace HotelBookingPlatform.Infrastructure.Authentication;

public class JwtOptions
{
    public const string SectionName = "Jwt";

    public string Issuer { get; init; } = "HotelBookingPlatform";
    public string Audience { get; init; } = "HotelBookingPlatform.Client";
    public string SigningKey { get; init; } = string.Empty;
    public int AccessTokenExpirationMinutes { get; init; } = 15;
    public int RefreshTokenExpirationDays { get; init; } = 7;
}

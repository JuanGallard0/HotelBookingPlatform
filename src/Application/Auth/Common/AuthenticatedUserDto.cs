namespace HotelBookingPlatform.Application.Auth.Common;

public record AuthenticatedUserDto
{
    public int Id { get; init; }
    public string Email { get; init; } = string.Empty;
    public string FirstName { get; init; } = string.Empty;
    public string LastName { get; init; } = string.Empty;
    public string FullName { get; init; } = string.Empty;
    public string Role { get; init; } = string.Empty;
}

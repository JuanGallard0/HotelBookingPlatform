namespace HotelBookingPlatform.Infrastructure.IntegrationTests;

internal sealed class FakeCurrentUserService(int? userId = null, string? email = null, string? role = null)
    : ICurrentUserService
{
    public bool IsAuthenticated => userId.HasValue;
    public int? UserId => userId;
    public string? Email => email;
    public string? Role => role;
}

namespace HotelBookingPlatform.Domain.Entities;

public class RefreshToken : BaseAuditableEntity
{
    public int UserId { get; set; }
    public string TokenHash { get; set; } = string.Empty;
    public DateTimeOffset ExpiresAt { get; set; }
    public DateTimeOffset? RevokedAt { get; set; }
    public string? CreatedByIp { get; set; }
    public string? ReplacedByTokenHash { get; set; }

    public User User { get; set; } = null!;
}

namespace HotelBookingPlatform.Domain.Entities;

public class IdempotencyRecord : BaseEntity
{
    public string IdempotencyKey { get; set; } = string.Empty;
    public string RequestPath { get; set; } = string.Empty;
    public string? RequestHash { get; set; }
    public int ResponseStatusCode { get; set; }
    public string ResponseBody { get; set; } = string.Empty;
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset ExpiresAt { get; set; }

    public bool IsExpired()
    {
        return DateTimeOffset.UtcNow > ExpiresAt;
    }

    public static IdempotencyRecord Create(
        string idempotencyKey,
        string requestPath,
        int responseStatusCode,
        string responseBody,
        string? requestHash = null,
        int expirationHours = 24)
    {
        return new IdempotencyRecord
        {
            IdempotencyKey = idempotencyKey,
            RequestPath = requestPath,
            RequestHash = requestHash,
            ResponseStatusCode = responseStatusCode,
            ResponseBody = responseBody,
            CreatedAt = DateTimeOffset.UtcNow,
            ExpiresAt = DateTimeOffset.UtcNow.AddHours(expirationHours)
        };
    }
}

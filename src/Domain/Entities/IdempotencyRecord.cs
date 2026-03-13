namespace HotelBookingPlatform.Domain.Entities;

public class IdempotencyRecord : BaseEntity
{
    public string IdempotencyKey { get; set; } = string.Empty;
    public string RequestPath { get; set; } = string.Empty;
    public string? RequestHash { get; set; }
    public int ResponseStatusCode { get; set; }
    public string ResponseBody { get; set; } = string.Empty;
    public string? ResponseContentType { get; set; }
    public string? ResponseHeadersJson { get; set; }
    public string? ResourceLocation { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset ExpiresAt { get; set; }

    public bool IsExpired()
    {
        return DateTimeOffset.UtcNow > ExpiresAt;
    }

    public bool IsCompleted()
    {
        return ResponseStatusCode > 0;
    }

    public static IdempotencyRecord Create(
        string idempotencyKey,
        string requestPath,
        string? requestHash = null,
        int expirationHours = 24)
    {
        return new IdempotencyRecord
        {
            IdempotencyKey = idempotencyKey,
            RequestPath = requestPath,
            RequestHash = requestHash,
            ResponseStatusCode = 0,
            ResponseBody = string.Empty,
            CreatedAt = DateTimeOffset.UtcNow,
            ExpiresAt = DateTimeOffset.UtcNow.AddHours(expirationHours)
        };
    }

    public void Complete(
        int responseStatusCode,
        string responseBody,
        string? responseContentType,
        string? responseHeadersJson,
        string? resourceLocation)
    {
        ResponseStatusCode = responseStatusCode;
        ResponseBody = responseBody;
        ResponseContentType = responseContentType;
        ResponseHeadersJson = responseHeadersJson;
        ResourceLocation = resourceLocation;
    }

    public static IdempotencyRecord CreateCompleted(
        string idempotencyKey,
        string requestPath,
        int responseStatusCode,
        string responseBody,
        string? requestHash = null,
        string? responseContentType = null,
        string? responseHeadersJson = null,
        string? resourceLocation = null,
        int expirationHours = 24)
    {
        return new IdempotencyRecord
        {
            IdempotencyKey = idempotencyKey,
            RequestPath = requestPath,
            RequestHash = requestHash,
            ResponseStatusCode = responseStatusCode,
            ResponseBody = responseBody,
            ResponseContentType = responseContentType,
            ResponseHeadersJson = responseHeadersJson,
            ResourceLocation = resourceLocation,
            CreatedAt = DateTimeOffset.UtcNow,
            ExpiresAt = DateTimeOffset.UtcNow.AddHours(expirationHours)
        };
    }
}

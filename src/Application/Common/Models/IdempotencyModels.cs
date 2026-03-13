namespace HotelBookingPlatform.Application.Common.Models;

public enum IdempotencyExecutionStatus
{
    Started,
    Replay,
    RequestMismatch,
    InProgress
}

public sealed record StoredResponse(
    string Key,
    string RequestPath,
    string? RequestHash,
    int StatusCode,
    string ResponseBody,
    string? ContentType,
    IReadOnlyDictionary<string, string[]> Headers,
    string? ResourceLocation,
    DateTimeOffset ExpiresAt);

public sealed record ResponseSnapshot(
    int StatusCode,
    string ResponseBody,
    string? ContentType,
    IReadOnlyDictionary<string, string[]> Headers,
    string? ResourceLocation);

public sealed record IdempotencyExecutionResult(
    IdempotencyExecutionStatus Status,
    StoredResponse? Response = null);

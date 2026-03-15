namespace HotelBookingPlatform.Application.AuditLogs.Queries.GetAuditLogs;

public sealed record AuditLogDto(
    int Id,
    string EntityName,
    int EntityId,
    string Action,
    string? UserId,
    string? UserName,
    DateTimeOffset Timestamp,
    string? OldValues,
    string? NewValues,
    string? AdditionalInfo);

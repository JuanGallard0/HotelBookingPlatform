namespace HotelBookingPlatform.Application.Common.Models;

public sealed record AuditLogEntry(
    string EntityName,
    int EntityId,
    string Action,
    string? OldValues = null,
    string? NewValues = null,
    string? AdditionalInfo = null);

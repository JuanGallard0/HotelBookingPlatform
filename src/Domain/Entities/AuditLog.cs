namespace HotelBookingPlatform.Domain.Entities;

public class AuditLog : BaseEntity
{
    public string EntityName { get; set; } = string.Empty;
    public int EntityId { get; set; }
    public string Action { get; set; } = string.Empty;
    public string? UserId { get; set; }
    public string? UserName { get; set; }
    public DateTimeOffset Timestamp { get; set; }
    public string? OldValues { get; set; }
    public string? NewValues { get; set; }
    public string? AdditionalInfo { get; set; }

    public static AuditLog Create(
        string entityName,
        int entityId,
        string action,
        string? userId = null,
        string? userName = null,
        string? oldValues = null,
        string? newValues = null,
        string? additionalInfo = null)
    {
        return new AuditLog
        {
            EntityName = entityName,
            EntityId = entityId,
            Action = action,
            UserId = userId,
            UserName = userName,
            Timestamp = DateTimeOffset.UtcNow,
            OldValues = oldValues,
            NewValues = newValues,
            AdditionalInfo = additionalInfo
        };
    }
}

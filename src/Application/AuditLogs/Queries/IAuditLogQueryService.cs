using HotelBookingPlatform.Application.AuditLogs.Queries.GetAuditLogs;

namespace HotelBookingPlatform.Application.AuditLogs.Queries;

public interface IAuditLogQueryService
{
    Task<(IReadOnlyList<AuditLogDto> Logs, int TotalCount)> GetAuditLogsAsync(
        GetAuditLogsQuery query,
        CancellationToken cancellationToken);
}

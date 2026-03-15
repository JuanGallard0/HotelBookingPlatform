using HotelBookingPlatform.Application.AuditLogs.Queries;
using HotelBookingPlatform.Application.Common.Models;

namespace HotelBookingPlatform.Application.AuditLogs.Queries.GetAuditLogs;

public record GetAuditLogsQuery : PagedSortedRequest, IRequest<Result<PagedResponse<AuditLogDto>>>
{
    public string? EntityName { get; init; }
    public int? EntityId { get; init; }
    public string? Action { get; init; }
    public string? UserId { get; init; }
    public string? UserName { get; init; }
    public DateTimeOffset? From { get; init; }
    public DateTimeOffset? To { get; init; }

    public static readonly IReadOnlySet<string> AllowedSortColumns =
        new HashSet<string>(StringComparer.OrdinalIgnoreCase)
        {
            "Id", "EntityName", "EntityId", "Action", "UserName", "Timestamp"
        };
}

public class GetAuditLogsQueryHandler(IAuditLogQueryService auditLogQueryService)
    : IRequestHandler<GetAuditLogsQuery, Result<PagedResponse<AuditLogDto>>>
{
    public async Task<Result<PagedResponse<AuditLogDto>>> Handle(
        GetAuditLogsQuery request,
        CancellationToken cancellationToken)
    {
        var (logs, totalCount) = await auditLogQueryService.GetAuditLogsAsync(request, cancellationToken);

        return Result<PagedResponse<AuditLogDto>>.Success(
            new PagedResponse<AuditLogDto>(logs, request.ResolvedPageNumber, request.ResolvedPageSize, totalCount));
    }
}

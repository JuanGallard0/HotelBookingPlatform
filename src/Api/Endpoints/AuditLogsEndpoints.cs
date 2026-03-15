using HotelBookingPlatform.Application.AuditLogs.Queries.GetAuditLogs;
using HotelBookingPlatform.Application.Common.Models;

namespace HotelBookingPlatform.Api.Endpoints;

public class AuditLogsEndpoints : EndpointGroupBase
{
    public override string GroupName => "audit-logs";

    public override void Map(RouteGroupBuilder group)
    {
        group.MapGet(GetAuditLogs)
            .WithSummary("Get audit logs")
            .Produces<ApiResponse<PagedResponse<AuditLogDto>>>(StatusCodes.Status200OK)
            .Produces<ApiResponse<object?>>(StatusCodes.Status401Unauthorized)
            .Produces<ApiResponse<object?>>(StatusCodes.Status403Forbidden)
            .RequireAuthorization("AdminOnly");
    }

    private static async Task<IResult> GetAuditLogs(
        [AsParameters] GetAuditLogsQuery query,
        ISender sender,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(query, cancellationToken);
        return result.ToHttpResult();
    }
}

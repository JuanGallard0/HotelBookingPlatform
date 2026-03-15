using Dapper;
using HotelBookingPlatform.Application.AuditLogs.Queries;
using HotelBookingPlatform.Application.AuditLogs.Queries.GetAuditLogs;
using HotelBookingPlatform.Application.Common.Interfaces;

namespace HotelBookingPlatform.Infrastructure.Auditing;

public sealed class AuditLogQueryService(IDbConnectionFactory connectionFactory) : IAuditLogQueryService
{
    private static readonly IReadOnlyDictionary<string, string> SortColumnExpressions =
        new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
        {
            ["Id"] = "al.Id",
            ["EntityName"] = "al.EntityName",
            ["EntityId"] = "al.EntityId",
            ["Action"] = "al.Action",
            ["UserName"] = "al.UserName",
            ["Timestamp"] = "al.Timestamp",
        };

    public async Task<(IReadOnlyList<AuditLogDto> Logs, int TotalCount)> GetAuditLogsAsync(
        GetAuditLogsQuery query,
        CancellationToken cancellationToken)
    {
        using var connection = connectionFactory.CreateConnection();

        var builder = new SqlBuilder();

        var parameters = new
        {
            Offset = (query.ResolvedPageNumber - 1) * query.ResolvedPageSize,
            PageSize = query.ResolvedPageSize,
        };

        var dataTemplate = builder.AddTemplate(
            """
            SELECT
                al.Id,
                al.EntityName,
                al.EntityId,
                al.Action,
                al.UserId,
                al.UserName,
                al.Timestamp,
                al.OldValues,
                al.NewValues,
                al.AdditionalInfo
            FROM AuditLogs al
            /**where**/
            /**orderby**/
            OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY
            """,
            parameters);

        var countTemplate = builder.AddTemplate(
            """
            SELECT COUNT(*)
            FROM AuditLogs al
            /**where**/
            """,
            parameters);

        ApplyFilters(builder, query);

        var sortExpression = !string.IsNullOrWhiteSpace(query.SortBy)
                             && SortColumnExpressions.TryGetValue(query.SortBy, out var expr)
            ? expr
            : "al.Timestamp";

        var direction = string.Equals(query.ResolvedSortDirection, "desc", StringComparison.OrdinalIgnoreCase)
            ? "DESC"
            : "ASC";

        builder.OrderBy($"{sortExpression} {direction}");

        var combinedSql = $"{dataTemplate.RawSql};\n{countTemplate.RawSql}";

        using var multi = await connection.QueryMultipleAsync(
            new CommandDefinition(
                combinedSql,
                dataTemplate.Parameters,
                cancellationToken: cancellationToken));

        var logs = (await multi.ReadAsync<AuditLogDto>()).AsList();
        var totalCount = await multi.ReadFirstAsync<int>();

        return (logs, totalCount);
    }

    private static void ApplyFilters(SqlBuilder builder, GetAuditLogsQuery query)
    {
        if (!string.IsNullOrWhiteSpace(query.EntityName))
            builder.Where("al.EntityName = @EntityName", new { query.EntityName });

        if (query.EntityId.HasValue)
            builder.Where("al.EntityId = @EntityId", new { query.EntityId });

        if (!string.IsNullOrWhiteSpace(query.Action))
            builder.Where("al.Action = @Action", new { query.Action });

        if (!string.IsNullOrWhiteSpace(query.UserId))
            builder.Where("al.UserId = @UserId", new { query.UserId });

        if (!string.IsNullOrWhiteSpace(query.UserName))
            builder.Where("al.UserName LIKE @UserName", new { UserName = $"%{query.UserName}%" });

        if (query.From.HasValue)
            builder.Where("al.Timestamp >= @From", new { query.From });

        if (query.To.HasValue)
            builder.Where("al.Timestamp <= @To", new { query.To });
    }
}

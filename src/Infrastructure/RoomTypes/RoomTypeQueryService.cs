using Dapper;
using HotelBookingPlatform.Application.Common.Interfaces;
using HotelBookingPlatform.Application.RoomTypes.Queries;
using HotelBookingPlatform.Application.RoomTypes.Queries.GetRoomTypes;

namespace HotelBookingPlatform.Infrastructure.RoomTypes;

public sealed class RoomTypeQueryService(IDbConnectionFactory connectionFactory) : IRoomTypeQueryService
{
    public async Task<RoomTypeQueryResult> GetRoomTypesAsync(
        GetRoomTypesQuery query,
        CancellationToken cancellationToken)
    {
        using var connection = connectionFactory.CreateConnection();

        var builder = new SqlBuilder();

        var pageNumber = query.ResolvedPageNumber;
        var pageSize   = query.ResolvedPageSize;

        var dataTemplate = builder.AddTemplate(@"
            SELECT
                rt.Id,
                rt.HotelId,
                rt.Name,
                rt.Description,
                rt.MaxOccupancy,
                rt.BasePrice,
                rt.IsActive
            FROM RoomTypes rt
            /**where**/
            /**orderby**/
            OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY",
            new
            {
                Offset   = (pageNumber - 1) * pageSize,
                PageSize = pageSize
            });

        var countTemplate = builder.AddTemplate(@"
            SELECT COUNT(*)
            FROM RoomTypes rt
            /**where**/");

        builder.Where("rt.HotelId = @HotelId", new { query.HotelId });

        if (query.IsActive.HasValue)
            builder.Where("rt.IsActive = @IsActive", new { query.IsActive });

        var sortColumn = GetSafeColumn(query.SortBy, "Id");
        var direction  = "desc".Equals(query.ResolvedSortDirection, StringComparison.OrdinalIgnoreCase) ? "DESC" : "ASC";
        builder.OrderBy($"rt.{sortColumn} {direction}");

        var combinedSql = $"{dataTemplate.RawSql};\n{countTemplate.RawSql}";

        using var multi = await connection.QueryMultipleAsync(
            new CommandDefinition(combinedSql, dataTemplate.Parameters, cancellationToken: cancellationToken));

        var roomTypes  = (await multi.ReadAsync<RoomTypeDto>()).AsList();
        var totalCount = await multi.ReadFirstAsync<int>();

        return new RoomTypeQueryResult(roomTypes, totalCount);
    }

    public async Task<RoomTypeDto?> GetRoomTypeByIdAsync(
        int hotelId,
        int id,
        CancellationToken cancellationToken)
    {
        using var connection = connectionFactory.CreateConnection();

        const string sql = @"
            SELECT
                rt.Id,
                rt.HotelId,
                rt.Name,
                rt.Description,
                rt.MaxOccupancy,
                rt.BasePrice,
                rt.IsActive
            FROM RoomTypes rt
            WHERE rt.Id = @Id AND rt.HotelId = @HotelId";

        return await connection.QuerySingleOrDefaultAsync<RoomTypeDto>(
            new CommandDefinition(sql, new { Id = id, HotelId = hotelId }, cancellationToken: cancellationToken));
    }

    private static string GetSafeColumn(string? requested, string defaultColumn)
    {
        return !string.IsNullOrWhiteSpace(requested)
               && GetRoomTypesQuery.AllowedSortColumns.Contains(requested)
            ? requested
            : defaultColumn;
    }
}

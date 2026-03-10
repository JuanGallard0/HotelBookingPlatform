using Dapper;
using HotelBookingPlatform.Application.Common.Interfaces;
using HotelBookingPlatform.Application.Hotels.Queries;
using HotelBookingPlatform.Application.Hotels.Queries.GetHotelById;
using HotelBookingPlatform.Application.Hotels.Queries.GetHotels;

namespace HotelBookingPlatform.Infrastructure.Hotels;

public sealed class HotelQueryService(IDbConnectionFactory connectionFactory) : IHotelQueryService
{
    public async Task<HotelQueryResult> GetHotelsAsync(
        GetHotelsQuery query,
        CancellationToken cancellationToken)
    {
        using var connection = connectionFactory.CreateConnection();

        var builder = new SqlBuilder();

        var pageNumber = query.ResolvedPageNumber;
        var pageSize   = query.ResolvedPageSize;

        var dataTemplate = builder.AddTemplate(@"
            SELECT
                h.Id,
                h.Name,
                h.Description,
                h.Address,
                h.City,
                h.Country,
                h.Email,
                h.PhoneNumber,
                h.StarRating,
                h.IsActive,
                (
                    SELECT COUNT(*)
                    FROM RoomTypes rt
                    WHERE rt.HotelId = h.Id
                      AND rt.IsActive = 1
                ) AS ActiveRoomTypeCount
            FROM Hotels h
            /**where**/
            /**orderby**/
            OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY",
            new
            {
                Offset = (pageNumber - 1) * pageSize,
                PageSize = pageSize
            });

        var countTemplate = builder.AddTemplate(@"
            SELECT COUNT(*)
            FROM Hotels h
            /**where**/");

        ApplyFilters(builder, query);

        var sortColumn = GetSafeColumn(query.SortBy, "Id");
        var direction = "desc".Equals(query.ResolvedSortDirection, StringComparison.OrdinalIgnoreCase) ? "DESC" : "ASC";
        builder.OrderBy($"h.{sortColumn} {direction}");

        var combinedSql = $"{dataTemplate.RawSql};\n{countTemplate.RawSql}";

        using var multi = await connection.QueryMultipleAsync(
            new CommandDefinition(combinedSql, dataTemplate.Parameters, cancellationToken: cancellationToken));

        var hotels = (await multi.ReadAsync<HotelDto>()).AsList();
        var totalCount = await multi.ReadFirstAsync<int>();

        return new HotelQueryResult(hotels, totalCount);
    }

    private static void ApplyFilters(SqlBuilder builder, GetHotelsQuery query)
    {
        if (!string.IsNullOrWhiteSpace(query.Name))
            builder.Where("h.Name LIKE @Name", new { Name = $"%{query.Name}%" });

        if (!string.IsNullOrWhiteSpace(query.City))
            builder.Where("h.City = @City", new { query.City });

        if (!string.IsNullOrWhiteSpace(query.Country))
            builder.Where("h.Country = @Country", new { query.Country });

        if (query.StarRating.HasValue)
            builder.Where("h.StarRating = @StarRating", new { query.StarRating });

        if (query.IsActive.HasValue)
            builder.Where("h.IsActive = @IsActive", new { query.IsActive });

        if (query.CheckIn.HasValue && query.CheckOut.HasValue)
        {
            var nights = query.CheckOut.Value.DayNumber - query.CheckIn.Value.DayNumber;

            builder.Where(@"
                EXISTS (
                    SELECT 1
                    FROM RoomTypes rt
                    INNER JOIN RoomInventories ri ON ri.RoomTypeId = rt.Id
                    WHERE rt.HotelId = h.Id
                      AND rt.IsActive = 1
                      AND (@NumberOfGuests IS NULL OR rt.MaxOccupancy >= @NumberOfGuests)
                      AND ri.Date >= @CheckIn
                      AND ri.Date < @CheckOut
                      AND ri.AvailableRooms > 0
                    GROUP BY rt.Id
                    HAVING COUNT(ri.Date) = @Nights
                )",
                new
                {
                    CheckIn = query.CheckIn.Value.ToDateTime(TimeOnly.MinValue),
                    CheckOut = query.CheckOut.Value.ToDateTime(TimeOnly.MinValue),
                    query.NumberOfGuests,
                    Nights = nights
                });
        }
    }

    public async Task<HotelDetailDto?> GetHotelByIdAsync(int id, CancellationToken cancellationToken)
    {
        using var connection = connectionFactory.CreateConnection();

        const string sql = @"
            SELECT
                h.Id,
                h.Name,
                h.Description,
                h.Address,
                h.City,
                h.Country,
                h.Email,
                h.PhoneNumber,
                h.StarRating,
                h.IsActive,
                rt.Id,
                rt.Name,
                rt.Description,
                rt.MaxOccupancy,
                rt.BasePrice
            FROM Hotels h
            LEFT JOIN RoomTypes rt ON rt.HotelId = h.Id AND rt.IsActive = 1
            WHERE h.Id = @Id";

        HotelDetailDto? hotel = null;

        await connection.QueryAsync<HotelDetailDto, RoomTypeSummaryDto?, HotelDetailDto>(
            new CommandDefinition(sql, new { Id = id }, cancellationToken: cancellationToken),
            (h, rt) =>
            {
                hotel ??= h;
                if (rt is not null)
                    hotel = hotel with { RoomTypes = [.. hotel.RoomTypes, rt] };
                return hotel;
            },
            splitOn: "Id");

        return hotel;
    }

    private static string GetSafeColumn(string? requested, string defaultColumn)
    {
        return !string.IsNullOrWhiteSpace(requested)
               && GetHotelsQuery.AllowedSortColumns.Contains(requested)
            ? requested
            : defaultColumn;
    }
}

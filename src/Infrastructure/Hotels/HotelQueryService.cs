using Dapper;
using HotelBookingPlatform.Application.Common.Interfaces;
using HotelBookingPlatform.Application.Hotels.Queries;
using HotelBookingPlatform.Application.Hotels.Queries.GetAvailableHotels;
using HotelBookingPlatform.Application.Hotels.Queries.GetHotelAvailability;

namespace HotelBookingPlatform.Infrastructure.Hotels;

public sealed class HotelQueryService(IDbConnectionFactory connectionFactory) : IHotelQueryService
{
    private static readonly IReadOnlyDictionary<string, string> SortColumnExpressions =
        new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
        {
            ["HotelId"] = "h.Id",
            ["Name"] = "h.Name",
            ["City"] = "h.City",
            ["Country"] = "h.Country",
            ["StarRating"] = "h.StarRating",
            ["PricePerNightFrom"] = "avail.PricePerNightFrom",
        };

    public async Task<(IReadOnlyList<AvailableHotelDto> Hotels, int TotalCount)> GetAvailableHotelsAsync(
        GetAvailableHotelsQuery query,
        CancellationToken cancellationToken)
    {
        using var connection = connectionFactory.CreateConnection();

        var builder = new SqlBuilder();

        var pageNumber = query.ResolvedPageNumber;
        var pageSize = query.ResolvedPageSize;

        var checkIn = query.CheckIn?.ToDateTime(TimeOnly.MinValue);
        var checkOut = query.CheckOut?.ToDateTime(TimeOnly.MinValue);

        var nights = query.CheckIn.HasValue && query.CheckOut.HasValue
            ? query.CheckOut.Value.DayNumber - query.CheckIn.Value.DayNumber
            : 0;

        var parameters = new
        {
            CheckIn = (DateTime?)checkIn,
            CheckOut = (DateTime?)checkOut,
            Nights = nights,
            query.NumberOfGuests,
            Offset = (pageNumber - 1) * pageSize,
            PageSize = pageSize
        };

        var dataTemplate = builder.AddTemplate(
            """
            SELECT
                h.Id AS HotelId,
                h.Name,
                h.Description,
                h.Address,
                h.City,
                h.Country,
                h.StarRating,
                avail.AvailableRoomTypeCount,
                avail.TotalAvailableRooms,
                avail.MaxSupportedOccupancy,
                avail.PricePerNightFrom,
                avail.PricePerNightFrom * @Nights AS TotalPriceFrom,
                (
                    SELECT TOP 1 best_rp.DiscountPercentage
                    FROM RoomTypes rt2
                    LEFT JOIN (
                        SELECT
                            ri2.RoomTypeId
                        FROM RoomInventories ri2
                        WHERE ri2.Date >= @CheckIn
                          AND ri2.Date < @CheckOut
                        GROUP BY ri2.RoomTypeId
                        HAVING COUNT(ri2.Date) = @Nights
                           AND MIN(ri2.AvailableRooms) > 0
                    ) avail_check
                        ON avail_check.RoomTypeId = rt2.Id
                    OUTER APPLY (
                        SELECT TOP 1
                            rp.PricePerNight,
                            rp.DiscountPercentage
                        FROM RatePlans rp
                        WHERE rp.RoomTypeId = rt2.Id
                          AND rp.IsActive = 1
                          AND (
                                @CheckIn IS NULL
                                OR (rp.ValidFrom <= @CheckIn AND rp.ValidTo >= @CheckOut)
                              )
                        ORDER BY rp.PricePerNight
                    ) best_rp
                    WHERE rt2.HotelId = h.Id
                      AND rt2.IsActive = 1
                      AND (@CheckIn IS NULL OR avail_check.RoomTypeId IS NOT NULL)
                      AND (@NumberOfGuests IS NULL OR rt2.MaxOccupancy >= @NumberOfGuests)
                    ORDER BY COALESCE(best_rp.PricePerNight, rt2.BasePrice)
                ) AS DiscountPercentage,
                'USD' AS Currency
            FROM Hotels h
            INNER JOIN (
                SELECT
                    rt.HotelId,
                    COUNT(DISTINCT rt.Id) AS AvailableRoomTypeCount,
                    ISNULL(SUM(min_ri.MinAvailable), 0) AS TotalAvailableRooms,
                    MAX(rt.MaxOccupancy) AS MaxSupportedOccupancy,
                    MIN(COALESCE(best_rp.PricePerNight, rt.BasePrice)) AS PricePerNightFrom
                FROM RoomTypes rt
                LEFT JOIN (
                    SELECT
                        ri.RoomTypeId,
                        MIN(ri.AvailableRooms) AS MinAvailable
                    FROM RoomInventories ri
                    WHERE ri.Date >= @CheckIn
                      AND ri.Date < @CheckOut
                    GROUP BY ri.RoomTypeId
                    HAVING COUNT(ri.Date) = @Nights
                       AND MIN(ri.AvailableRooms) > 0
                ) min_ri
                    ON min_ri.RoomTypeId = rt.Id
                OUTER APPLY (
                    SELECT TOP 1
                        rp.PricePerNight
                    FROM RatePlans rp
                    WHERE rp.RoomTypeId = rt.Id
                      AND rp.IsActive = 1
                      AND (
                            @CheckIn IS NULL
                            OR (rp.ValidFrom <= @CheckIn AND rp.ValidTo >= @CheckOut)
                          )
                    ORDER BY rp.PricePerNight
                ) best_rp
                WHERE rt.IsActive = 1
                  AND (@CheckIn IS NULL OR min_ri.RoomTypeId IS NOT NULL)
                  AND (@NumberOfGuests IS NULL OR rt.MaxOccupancy >= @NumberOfGuests)
                GROUP BY rt.HotelId
            ) avail
                ON avail.HotelId = h.Id
            /**where**/
            /**orderby**/
            OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY
            """,
            parameters);

        var countTemplate = builder.AddTemplate(
            """
            SELECT COUNT(*)
            FROM Hotels h
            INNER JOIN (
                SELECT
                    rt.HotelId
                FROM RoomTypes rt
                LEFT JOIN (
                    SELECT
                        ri.RoomTypeId
                    FROM RoomInventories ri
                    WHERE ri.Date >= @CheckIn
                      AND ri.Date < @CheckOut
                    GROUP BY ri.RoomTypeId
                    HAVING COUNT(ri.Date) = @Nights
                       AND MIN(ri.AvailableRooms) > 0
                ) min_ri
                    ON min_ri.RoomTypeId = rt.Id
                WHERE rt.IsActive = 1
                  AND (@CheckIn IS NULL OR min_ri.RoomTypeId IS NOT NULL)
                  AND (@NumberOfGuests IS NULL OR rt.MaxOccupancy >= @NumberOfGuests)
                GROUP BY rt.HotelId
            ) avail
                ON avail.HotelId = h.Id
            /**where**/
            """,
            parameters);

        ApplyFilters(builder, query);

        var sortExpression = GetSortExpression(query.SortBy);
        var direction = string.Equals(
            query.ResolvedSortDirection,
            "desc",
            StringComparison.OrdinalIgnoreCase)
            ? "DESC"
            : "ASC";

        builder.OrderBy($"{sortExpression} {direction}");

        var combinedSql = $"{dataTemplate.RawSql};\n{countTemplate.RawSql}";

        using var multi = await connection.QueryMultipleAsync(
            new CommandDefinition(
                combinedSql,
                dataTemplate.Parameters,
                cancellationToken: cancellationToken));

        var hotels = (await multi.ReadAsync<AvailableHotelDto>()).AsList();
        var totalCount = await multi.ReadFirstAsync<int>();

        return (hotels, totalCount);
    }

    private static void ApplyFilters(SqlBuilder builder, GetAvailableHotelsQuery query)
    {
        if (!string.IsNullOrWhiteSpace(query.Name))
        {
            builder.Where("h.Name LIKE @Name", new { Name = $"%{query.Name}%" });
        }

        if (!string.IsNullOrWhiteSpace(query.City))
        {
            builder.Where("h.City = @City", new { query.City });
        }

        if (!string.IsNullOrWhiteSpace(query.Country))
        {
            builder.Where("h.Country = @Country", new { query.Country });
        }

        if (query.StarRating.HasValue)
        {
            builder.Where("h.StarRating = @StarRating", new { query.StarRating });
        }
    }

    private static string GetSortExpression(string? requested)
    {
        return !string.IsNullOrWhiteSpace(requested)
               && SortColumnExpressions.TryGetValue(requested, out var expression)
            ? expression
            : "h.Id";
    }

    public async Task<IReadOnlyList<AvailableRoomTypeDto>> GetHotelAvailabilityAsync(
        GetHotelAvailabilityQuery query,
        CancellationToken cancellationToken)
    {
        using var connection = connectionFactory.CreateConnection();

        var checkIn = query.CheckIn!.Value.ToDateTime(TimeOnly.MinValue);
        var checkOut = query.CheckOut!.Value.ToDateTime(TimeOnly.MinValue);
        var nights = query.CheckOut.Value.DayNumber - query.CheckIn.Value.DayNumber;

        var roomTypes = await connection.QueryAsync<AvailableRoomTypeDto>(
            new CommandDefinition(
                """
                SELECT
                    rt.Id AS RoomTypeId,
                    rt.Name,
                    rt.Description,
                    rt.MaxOccupancy,
                    avail.MinAvailableRooms AS AvailableRooms,
                    COALESCE(best_rp.PricePerNight, rt.BasePrice) AS PricePerNight,
                    best_rp.DiscountPercentage,
                    COALESCE(best_rp.PricePerNight, rt.BasePrice) * @Nights AS TotalPrice,
                    'USD' AS Currency
                FROM RoomTypes rt
                INNER JOIN (
                    SELECT
                        ri.RoomTypeId,
                        MIN(ri.AvailableRooms) AS MinAvailableRooms
                    FROM RoomInventories ri
                    WHERE ri.Date >= @CheckIn
                      AND ri.Date < @CheckOut
                    GROUP BY ri.RoomTypeId
                    HAVING COUNT(ri.Date) = @Nights
                       AND MIN(ri.AvailableRooms) > 0
                ) avail ON avail.RoomTypeId = rt.Id
                OUTER APPLY (
                    SELECT TOP 1
                        rp.PricePerNight,
                        rp.DiscountPercentage
                    FROM RatePlans rp
                    WHERE rp.RoomTypeId = rt.Id
                      AND rp.IsActive = 1
                      AND rp.ValidFrom <= @CheckIn
                      AND rp.ValidTo >= @CheckOut
                    ORDER BY rp.PricePerNight
                ) best_rp
                WHERE rt.HotelId = @HotelId
                  AND rt.IsActive = 1
                  AND (@NumberOfGuests IS NULL OR rt.MaxOccupancy >= @NumberOfGuests)
                ORDER BY COALESCE(best_rp.PricePerNight, rt.BasePrice)
                """,
                new
                {
                    query.HotelId,
                    CheckIn = checkIn,
                    CheckOut = checkOut,
                    Nights = nights,
                    query.NumberOfGuests,
                },
                cancellationToken: cancellationToken));

        return roomTypes.AsList();
    }
}

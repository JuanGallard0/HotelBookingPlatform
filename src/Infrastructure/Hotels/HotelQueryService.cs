using Dapper;
using HotelBookingPlatform.Application.Common.Interfaces;
using HotelBookingPlatform.Application.Hotels.Queries;
using HotelBookingPlatform.Application.Hotels.Queries.GetAvailableHotels;
using HotelBookingPlatform.Application.Hotels.Queries.GetHotelAvailability;
using HotelBookingPlatform.Application.Hotels.Queries.GetHotelById;
using HotelBookingPlatform.Application.Hotels.Queries.GetHotelDetails;
using HotelBookingPlatform.Application.Hotels.Queries.GetHotelInventory;
using HotelBookingPlatform.Application.Hotels.Queries.GetHotels;

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
            NumberOfRooms = query.NumberOfRooms ?? 1,
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
                CASE WHEN @CheckIn IS NOT NULL THEN avail.PricePerNightFrom * @Nights ELSE NULL END AS TotalPriceFrom,
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
                           AND MIN(ri2.AvailableRooms) >= @NumberOfRooms
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
                    CASE WHEN @CheckIn IS NOT NULL THEN ISNULL(SUM(min_ri.MinAvailable), 0) ELSE NULL END AS TotalAvailableRooms,
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
                       AND MIN(ri.AvailableRooms) >= @NumberOfRooms
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
                       AND MIN(ri.AvailableRooms) >= @NumberOfRooms
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

        var checkIn = query.CheckIn.ToDateTime(TimeOnly.MinValue);
        var checkOut = query.CheckOut.ToDateTime(TimeOnly.MinValue);
        var nights = query.CheckOut.DayNumber - query.CheckIn.DayNumber;

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
                       AND MIN(ri.AvailableRooms) >= @NumberOfRooms
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
                    NumberOfRooms = query.NumberOfRooms ?? 1,
                },
                cancellationToken: cancellationToken));

        return roomTypes.AsList();
    }

    public async Task<(IReadOnlyList<HotelDto> Hotels, int TotalCount)> GetHotelsAsync(
        GetHotelsQuery query,
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
                h.Id          AS HotelId,
                h.Name,
                h.Description,
                h.Address,
                h.City,
                h.Country,
                h.Email,
                h.PhoneNumber,
                h.StarRating,
                h.IsActive
            FROM Hotels h
            /**where**/
            /**orderby**/
            OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY
            """,
            parameters);

        var countTemplate = builder.AddTemplate(
            """
            SELECT COUNT(*)
            FROM Hotels h
            /**where**/
            """,
            parameters);

        ApplyGetHotelsFilters(builder, query);

        var sortColumn = !string.IsNullOrWhiteSpace(query.SortBy)
                         && GetHotelsSortColumns.TryGetValue(query.SortBy, out var expr)
            ? expr
            : "h.Id";

        var direction = string.Equals(query.ResolvedSortDirection, "desc", StringComparison.OrdinalIgnoreCase)
            ? "DESC"
            : "ASC";

        builder.OrderBy($"{sortColumn} {direction}");

        var combinedSql = $"{dataTemplate.RawSql};\n{countTemplate.RawSql}";

        using var multi = await connection.QueryMultipleAsync(
            new CommandDefinition(
                combinedSql,
                dataTemplate.Parameters,
                cancellationToken: cancellationToken));

        var hotels = (await multi.ReadAsync<HotelDto>()).AsList();
        var totalCount = await multi.ReadFirstAsync<int>();

        return (hotels, totalCount);
    }

    private static void ApplyGetHotelsFilters(SqlBuilder builder, GetHotelsQuery query)
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
    }

    private static readonly IReadOnlyDictionary<string, string> GetHotelsSortColumns =
        new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
        {
            ["HotelId"]    = "h.Id",
            ["Name"]       = "h.Name",
            ["City"]       = "h.City",
            ["Country"]    = "h.Country",
            ["StarRating"] = "h.StarRating",
            ["IsActive"]   = "h.IsActive",
        };

    public async Task<HotelDetailsDto?> GetHotelDetailsAsync(
        int hotelId,
        CancellationToken cancellationToken)
    {
        using var connection = connectionFactory.CreateConnection();

        const string sql =
            """
            SELECT
                h.Id AS HotelId,
                h.Name,
                h.Description,
                h.Address,
                h.City,
                h.Country,
                h.Email,
                h.PhoneNumber,
                h.StarRating,
                h.IsActive
            FROM Hotels h
            WHERE h.Id = @HotelId;

            SELECT
                rt.Id AS RoomTypeId,
                rt.Name,
                rt.Description,
                rt.MaxOccupancy,
                rt.BasePrice,
                rt.IsActive
            FROM RoomTypes rt
            WHERE rt.HotelId = @HotelId
            ORDER BY rt.Id;

            SELECT
                rp.Id AS RatePlanId,
                rp.RoomTypeId,
                rp.Name,
                rp.Description,
                rp.ValidFrom,
                rp.ValidTo,
                rp.PricePerNight,
                rp.DiscountPercentage,
                rp.IsActive
            FROM RatePlans rp
            INNER JOIN RoomTypes rt ON rt.Id = rp.RoomTypeId
            WHERE rt.HotelId = @HotelId
            ORDER BY rp.RoomTypeId, rp.ValidFrom, rp.Id;
            """;

        using var multi = await connection.QueryMultipleAsync(
            new CommandDefinition(
                sql,
                new { HotelId = hotelId },
                cancellationToken: cancellationToken));

        var hotel = await multi.ReadFirstOrDefaultAsync<HotelDetailsRow>();
        if (hotel is null)
            return null;

        var roomTypes = (await multi.ReadAsync<RoomTypeDetailsRow>()).AsList();
        var ratePlans = (await multi.ReadAsync<RatePlanDetailsRow>()).AsList();

        var ratePlansByRoomType = ratePlans
            .GroupBy(rp => rp.RoomTypeId)
            .ToDictionary(
                group => group.Key,
                group => (IReadOnlyList<RatePlanDetailsDto>)group
                    .Select(rp => new RatePlanDetailsDto
                    {
                        RatePlanId = rp.RatePlanId,
                        Name = rp.Name,
                        Description = rp.Description,
                        ValidFrom = DateOnly.FromDateTime(rp.ValidFrom),
                        ValidTo = DateOnly.FromDateTime(rp.ValidTo),
                        PricePerNight = rp.PricePerNight,
                        DiscountPercentage = rp.DiscountPercentage,
                        IsActive = rp.IsActive
                    })
                    .ToList());

        return new HotelDetailsDto
        {
            HotelId = hotel.HotelId,
            Name = hotel.Name,
            Description = hotel.Description,
            Address = hotel.Address,
            City = hotel.City,
            Country = hotel.Country,
            Email = hotel.Email,
            PhoneNumber = hotel.PhoneNumber,
            StarRating = hotel.StarRating,
            IsActive = hotel.IsActive,
            RoomTypes = roomTypes.Select(rt => new RoomTypeDetailsDto
            {
                RoomTypeId = rt.RoomTypeId,
                Name = rt.Name,
                Description = rt.Description,
                MaxOccupancy = rt.MaxOccupancy,
                BasePrice = rt.BasePrice,
                IsActive = rt.IsActive,
                RatePlans = ratePlansByRoomType.GetValueOrDefault(rt.RoomTypeId, [])
            }).ToList()
        };
    }

    public async Task<HotelInventoryDto?> GetHotelInventoryAsync(
        GetHotelInventoryQuery query,
        CancellationToken cancellationToken)
    {
        using var connection = connectionFactory.CreateConnection();

        const string sql =
            """
            SELECT h.Id AS HotelId
            FROM Hotels h
            WHERE h.Id = @HotelId;

            SELECT
                rt.Id AS RoomTypeId,
                rt.Name
            FROM RoomTypes rt
            WHERE rt.HotelId = @HotelId
            ORDER BY rt.Id;

            SELECT
                ri.RoomTypeId,
                ri.Date,
                ri.TotalRooms,
                ri.AvailableRooms,
                ri.RowVersion
            FROM RoomInventories ri
            INNER JOIN RoomTypes rt ON rt.Id = ri.RoomTypeId
            WHERE rt.HotelId = @HotelId
              AND ri.Date >= @From
              AND ri.Date <= @To
            ORDER BY ri.RoomTypeId, ri.Date;
            """;

        using var multi = await connection.QueryMultipleAsync(
            new CommandDefinition(
                sql,
                new
                {
                    query.HotelId,
                    From = query.From.ToDateTime(TimeOnly.MinValue),
                    To = query.To.ToDateTime(TimeOnly.MinValue)
                },
                cancellationToken: cancellationToken));

        var hotel = await multi.ReadFirstOrDefaultAsync<HotelInventoryHeaderRow>();
        if (hotel is null)
            return null;

        var roomTypes = (await multi.ReadAsync<HotelInventoryRoomTypeRow>()).AsList();
        var inventoryRows = (await multi.ReadAsync<InventoryDayRow>()).AsList();

        var inventoryByRoomType = inventoryRows
            .GroupBy(row => row.RoomTypeId)
            .ToDictionary(
                group => group.Key,
                group => (IReadOnlyList<InventoryDayDto>)group.Select(row => new InventoryDayDto
                {
                    Date = DateOnly.FromDateTime(row.Date),
                    TotalRooms = row.TotalRooms,
                    AvailableRooms = row.AvailableRooms,
                    ReservedRooms = row.TotalRooms - row.AvailableRooms,
                    RowVersion = Convert.ToBase64String(row.RowVersion)
                }).ToList());

        return new HotelInventoryDto
        {
            HotelId = hotel.HotelId,
            From = query.From,
            To = query.To,
            RoomTypes = roomTypes.Select(rt => new RoomTypeInventoryDto
            {
                RoomTypeId = rt.RoomTypeId,
                Name = rt.Name,
                Days = inventoryByRoomType.GetValueOrDefault(rt.RoomTypeId, [])
            }).ToList()
        };
    }

    private sealed record HotelDetailsRow(
        int HotelId,
        string Name,
        string Description,
        string Address,
        string City,
        string Country,
        string Email,
        string PhoneNumber,
        int StarRating,
        bool IsActive);

    private sealed record RoomTypeDetailsRow(
        int RoomTypeId,
        string Name,
        string Description,
        int MaxOccupancy,
        decimal BasePrice,
        bool IsActive);

    private sealed record RatePlanDetailsRow(
        int RatePlanId,
        int RoomTypeId,
        string Name,
        string Description,
        DateTime ValidFrom,
        DateTime ValidTo,
        decimal PricePerNight,
        decimal? DiscountPercentage,
        bool IsActive);

    private sealed record HotelInventoryHeaderRow(int HotelId);

    private sealed record HotelInventoryRoomTypeRow(int RoomTypeId, string Name);

    private sealed record InventoryDayRow(
        int RoomTypeId,
        DateTime Date,
        int TotalRooms,
        int AvailableRooms,
        byte[] RowVersion);
}

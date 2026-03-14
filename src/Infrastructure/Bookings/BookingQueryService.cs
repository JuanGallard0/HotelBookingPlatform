using Dapper;
using HotelBookingPlatform.Application.Bookings.Queries;
using HotelBookingPlatform.Application.Bookings.Queries.GetBookingById;
using HotelBookingPlatform.Application.Bookings.Queries.GetUserBookings;
using HotelBookingPlatform.Application.Common.Interfaces;
using HotelBookingPlatform.Domain.Enums;

namespace HotelBookingPlatform.Infrastructure.Bookings;

public sealed class BookingQueryService(IDbConnectionFactory connectionFactory) : IBookingQueryService
{
    private static readonly IReadOnlyDictionary<string, string> SortColumnExpressions =
        new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
        {
            ["BookingId"]   = "b.Id",
            ["CheckIn"]     = "b.CheckInDate",
            ["CheckOut"]    = "b.CheckOutDate",
            ["TotalAmount"] = "b.TotalAmount",
            ["Status"]      = "b.Status",
            ["CreatedAt"]   = "b.Created",
        };

    public async Task<(IReadOnlyList<UserBookingDto> Bookings, int TotalCount)> GetUserBookingsAsync(
        GetUserBookingsQuery query,
        int userId,
        CancellationToken cancellationToken)
    {
        using var connection = connectionFactory.CreateConnection();

        var builder = new SqlBuilder();

        var parameters = new
        {
            UserId = userId,
            Offset = (query.ResolvedPageNumber - 1) * query.ResolvedPageSize,
            PageSize = query.ResolvedPageSize,
        };

        var dataTemplate = builder.AddTemplate(
            """
            SELECT
                b.Id           AS BookingId,
                b.BookingNumber,
                h.Name         AS HotelName,
                rt.Name        AS RoomTypeName,
                b.Status,
                b.CheckInDate  AS CheckIn,
                b.CheckOutDate AS CheckOut,
                DATEDIFF(DAY, b.CheckInDate, b.CheckOutDate) AS Nights,
                b.NumberOfRooms,
                b.NumberOfGuests,
                b.TotalAmount,
                b.SpecialRequests,
                b.ConfirmedAt,
                b.CancelledAt,
                b.CancellationReason,
                b.Created      AS CreatedAt
            FROM Bookings b
            INNER JOIN RoomTypes rt ON rt.Id = b.RoomTypeId
            INNER JOIN Hotels   h  ON h.Id  = rt.HotelId
            /**where**/
            /**orderby**/
            OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY
            """,
            parameters);

        var countTemplate = builder.AddTemplate(
            """
            SELECT COUNT(*)
            FROM Bookings b
            INNER JOIN RoomTypes rt ON rt.Id = b.RoomTypeId
            INNER JOIN Hotels   h  ON h.Id  = rt.HotelId
            /**where**/
            """,
            parameters);

        builder.Where("b.UserId = @UserId", new { UserId = userId });

        if (query.Status.HasValue)
            builder.Where("b.Status = @Status", new { Status = (int)query.Status.Value });

        var sortExpression = GetSortExpression(query.SortBy);
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

        var rows = (await multi.ReadAsync<BookingRow>()).AsList();
        var totalCount = await multi.ReadFirstAsync<int>();

        var bookings = rows
            .Select(r => new UserBookingDto
            {
                BookingId          = r.BookingId,
                BookingNumber      = r.BookingNumber,
                HotelName          = r.HotelName,
                RoomTypeName       = r.RoomTypeName,
                Status             = (BookingStatus)r.Status,
                CheckIn            = DateOnly.FromDateTime(r.CheckIn),
                CheckOut           = DateOnly.FromDateTime(r.CheckOut),
                Nights             = r.Nights,
                NumberOfRooms      = r.NumberOfRooms,
                NumberOfGuests     = r.NumberOfGuests,
                TotalAmount        = r.TotalAmount,
                SpecialRequests    = r.SpecialRequests,
                ConfirmedAt        = r.ConfirmedAt,
                CancelledAt        = r.CancelledAt,
                CancellationReason = r.CancellationReason,
                CreatedAt          = r.CreatedAt,
            })
            .ToList();

        return (bookings, totalCount);
    }

    public async Task<BookingDetailsDto?> GetBookingByIdAsync(
        int bookingId,
        int userId,
        CancellationToken cancellationToken)
    {
        using var connection = connectionFactory.CreateConnection();

        const string sql =
            """
            SELECT
                b.Id AS BookingId,
                b.BookingNumber,
                h.Name AS HotelName,
                rt.Name AS RoomTypeName,
                b.Status,
                b.CheckInDate AS CheckIn,
                b.CheckOutDate AS CheckOut,
                DATEDIFF(DAY, b.CheckInDate, b.CheckOutDate) AS Nights,
                b.NumberOfRooms,
                b.NumberOfGuests,
                b.TotalAmount,
                'USD' AS Currency,
                b.SpecialRequests,
                b.ConfirmedAt,
                b.CancelledAt,
                b.CancellationReason,
                b.Created AS CreatedAt,
                g.FirstName AS GuestFirstName,
                g.LastName AS GuestLastName,
                g.Email AS GuestEmail,
                g.PhoneNumber AS GuestPhoneNumber,
                g.DocumentType AS GuestDocumentType,
                g.DocumentNumber AS GuestDocumentNumber,
                g.DateOfBirth AS GuestDateOfBirth,
                g.Nationality AS GuestNationality
            FROM Bookings b
            INNER JOIN Guests g ON g.Id = b.GuestId
            INNER JOIN RoomTypes rt ON rt.Id = b.RoomTypeId
            INNER JOIN Hotels h ON h.Id = rt.HotelId
            WHERE b.Id = @BookingId AND b.UserId = @UserId
            """;

        var row = await connection.QuerySingleOrDefaultAsync<BookingDetailsRow>(
            new CommandDefinition(
                sql,
                new { BookingId = bookingId, UserId = userId },
                cancellationToken: cancellationToken));

        return row is null
            ? null
            : new BookingDetailsDto
            {
                BookingId = row.BookingId,
                BookingNumber = row.BookingNumber,
                HotelName = row.HotelName,
                RoomTypeName = row.RoomTypeName,
                Status = (BookingStatus)row.Status,
                CheckIn = DateOnly.FromDateTime(row.CheckIn),
                CheckOut = DateOnly.FromDateTime(row.CheckOut),
                Nights = row.Nights,
                NumberOfRooms = row.NumberOfRooms,
                NumberOfGuests = row.NumberOfGuests,
                TotalAmount = row.TotalAmount,
                Currency = row.Currency,
                SpecialRequests = row.SpecialRequests,
                ConfirmedAt = row.ConfirmedAt,
                CancelledAt = row.CancelledAt,
                CancellationReason = row.CancellationReason,
                CreatedAt = row.CreatedAt,
                GuestFirstName = row.GuestFirstName,
                GuestLastName = row.GuestLastName,
                GuestEmail = row.GuestEmail,
                GuestPhoneNumber = row.GuestPhoneNumber,
                GuestDocumentType = row.GuestDocumentType,
                GuestDocumentNumber = row.GuestDocumentNumber,
                GuestDateOfBirth = row.GuestDateOfBirth is null
                    ? null
                    : DateOnly.FromDateTime(row.GuestDateOfBirth.Value),
                GuestNationality = row.GuestNationality,
            };
    }

    private static string GetSortExpression(string? requested) =>
        !string.IsNullOrWhiteSpace(requested) && SortColumnExpressions.TryGetValue(requested, out var expression)
            ? expression
            : "b.Id";

    private sealed record BookingRow(
        int BookingId,
        string BookingNumber,
        string HotelName,
        string RoomTypeName,
        int Status,
        DateTime CheckIn,
        DateTime CheckOut,
        int Nights,
        int NumberOfRooms,
        int NumberOfGuests,
        decimal TotalAmount,
        string? SpecialRequests,
        DateTimeOffset? ConfirmedAt,
        DateTimeOffset? CancelledAt,
        string? CancellationReason,
        DateTimeOffset CreatedAt);

    private sealed record BookingDetailsRow(
        int BookingId,
        string BookingNumber,
        string HotelName,
        string RoomTypeName,
        int Status,
        DateTime CheckIn,
        DateTime CheckOut,
        int Nights,
        int NumberOfRooms,
        int NumberOfGuests,
        decimal TotalAmount,
        string Currency,
        string? SpecialRequests,
        DateTimeOffset? ConfirmedAt,
        DateTimeOffset? CancelledAt,
        string? CancellationReason,
        DateTimeOffset CreatedAt,
        string GuestFirstName,
        string GuestLastName,
        string GuestEmail,
        string GuestPhoneNumber,
        string? GuestDocumentType,
        string? GuestDocumentNumber,
        DateTime? GuestDateOfBirth,
        string? GuestNationality);
}

using System.Text.Json;
using HotelBookingPlatform.Application.Bookings.Jobs;
using HotelBookingPlatform.Application.Common.Interfaces;
using HotelBookingPlatform.Application.Common.Models;
using HotelBookingPlatform.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace HotelBookingPlatform.Infrastructure.Bookings;

internal sealed class BookingExpirationService(
    IApplicationDbContext context,
    IUnitOfWork unitOfWork,
    IAvailabilityCache availabilityCache,
    IAuditLogService auditLogService,
    IOptions<BookingExpirationOptions> options,
    ILogger<BookingExpirationService> logger) : IBookingExpirationService
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    public async Task<int> ExpirePendingBookingsAsync(CancellationToken cancellationToken = default)
    {
        var settings = options.Value;
        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        if (!settings.Enabled)
        {
            logger.LogInformation("Booking expiration is disabled.");
            return 0;
        }

        var bookings = await context.Bookings
            .Where(b => b.Status == BookingStatus.Pending && b.CheckInDate < today)
            .OrderBy(b => b.CheckInDate)
            .Take(settings.BatchSize)
            .ToListAsync(cancellationToken);

        if (bookings.Count == 0)
        {
            logger.LogInformation(
                "No pending bookings found with a check-in date before {TodayUtcDate}.",
                today);
            return 0;
        }

        await unitOfWork.BeginTransactionAsync(cancellationToken);

        try
        {
            foreach (var booking in bookings)
            {
                var oldValues = JsonSerializer.Serialize(
                    new
                    {
                        booking.Status,
                        booking.Created,
                        booking.CheckInDate,
                        booking.CancelledAt,
                        booking.CancellationReason
                    },
                    JsonOptions);

                booking.Cancel(settings.CancellationReason);

                var newValues = JsonSerializer.Serialize(
                    new
                    {
                        booking.Status,
                        booking.CancelledAt,
                        booking.CancellationReason
                    },
                    JsonOptions);

                auditLogService.Add(new AuditLogEntry(
                    nameof(Domain.Entities.Booking),
                    booking.Id,
                    "Expired",
                    OldValues: oldValues,
                    NewValues: newValues,
                    AdditionalInfo: $"expiredBy=hangfire;checkInDate={booking.CheckInDate:O};evaluationDate={today:O}",
                    ActorUserId: "system",
                    ActorUserName: "hangfire"));
            }

            await unitOfWork.CommitAsync(cancellationToken);
            availabilityCache.InvalidateAll();

            logger.LogInformation(
                "Expired {ExpiredCount} pending bookings with a check-in date before {TodayUtcDate}.",
                bookings.Count,
                today);

            return bookings.Count;
        }
        catch (Exception)
        {
            await unitOfWork.RollbackAsync(cancellationToken);
            throw;
        }
    }
}

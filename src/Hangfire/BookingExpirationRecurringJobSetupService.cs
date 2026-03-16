using Hangfire;
using HotelBookingPlatform.Infrastructure.Bookings;
using Microsoft.Extensions.Options;

namespace HotelBookingPlatform.Hangfire;

public sealed class BookingExpirationRecurringJobSetupService(
    IRecurringJobManager recurringJobManager,
    IOptions<BookingExpirationOptions> options,
    ILogger<BookingExpirationRecurringJobSetupService> logger) : IHostedService
{
    public const string JobId = "bookings:expire-pending";

    public Task StartAsync(CancellationToken cancellationToken)
    {
        var settings = options.Value;

        if (!settings.Enabled)
        {
            recurringJobManager.RemoveIfExists(JobId);
            logger.LogInformation("Hangfire booking expiration job is disabled.");
            return Task.CompletedTask;
        }

        recurringJobManager.AddOrUpdate<ExpirePendingBookingsJob>(
            JobId,
            job => job.ExecuteAsync(),
            settings.CronExpression);

        logger.LogInformation(
            "Registered Hangfire job {JobId} with cron {CronExpression}.",
            JobId,
            settings.CronExpression);

        return Task.CompletedTask;
    }

    public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;
}

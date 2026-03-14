using Hangfire;
using Hangfire.Common;
using HotelBookingPlatform.Hangfire;
using HotelBookingPlatform.Infrastructure.Bookings;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Moq;
using NUnit.Framework;
using Shouldly;

namespace HotelBookingPlatform.Application.UnitTests.Bookings.Jobs;

[TestFixture]
public class BookingExpirationRecurringJobSetupServiceTests
{
    [Test]
    public async Task StartAsync_RegistersRecurringJob_WhenExpirationIsEnabled()
    {
        var recurringJobManager = new Mock<IRecurringJobManager>();
        var options = Options.Create(new BookingExpirationOptions
        {
            Enabled = true,
            CronExpression = "*/10 * * * *"
        });

        var sut = new BookingExpirationRecurringJobSetupService(
            recurringJobManager.Object,
            options,
            Mock.Of<ILogger<BookingExpirationRecurringJobSetupService>>());

        await sut.StartAsync(CancellationToken.None);

        recurringJobManager.Verify(
            x => x.AddOrUpdate(
                BookingExpirationRecurringJobSetupService.JobId,
                It.Is<Job>(job =>
                    job.Type == typeof(ExpirePendingBookingsJob) &&
                    job.Method.Name == nameof(ExpirePendingBookingsJob.ExecuteAsync)),
                "*/10 * * * *",
                It.IsAny<RecurringJobOptions>()),
            Times.Once);

        recurringJobManager.Verify(
            x => x.RemoveIfExists(It.IsAny<string>()),
            Times.Never);
    }

    [Test]
    public async Task StartAsync_RemovesRecurringJob_WhenExpirationIsDisabled()
    {
        var recurringJobManager = new Mock<IRecurringJobManager>();
        var options = Options.Create(new BookingExpirationOptions
        {
            Enabled = false
        });

        var sut = new BookingExpirationRecurringJobSetupService(
            recurringJobManager.Object,
            options,
            Mock.Of<ILogger<BookingExpirationRecurringJobSetupService>>());

        await sut.StartAsync(CancellationToken.None);

        recurringJobManager.Verify(
            x => x.RemoveIfExists(BookingExpirationRecurringJobSetupService.JobId),
            Times.Once);

        recurringJobManager.Verify(
            x => x.AddOrUpdate(
                It.IsAny<string>(),
                It.IsAny<Job>(),
                It.IsAny<string>(),
                It.IsAny<RecurringJobOptions>()),
            Times.Never);
    }
}

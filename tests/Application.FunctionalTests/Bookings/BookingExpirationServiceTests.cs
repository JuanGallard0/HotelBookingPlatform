using HotelBookingPlatform.Application.Bookings.Jobs;
using HotelBookingPlatform.Domain.Entities;
using HotelBookingPlatform.Domain.Enums;
using HotelBookingPlatform.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Shouldly;

namespace HotelBookingPlatform.Application.FunctionalTests.Bookings;

using static Testing;

[TestFixture]
public class BookingExpirationServiceTests : BaseTestFixture
{
    [Test]
    public async Task ExpirePendingBookingsAsync_CancelsPendingBooking_WhenCheckInDateHasPassed()
    {
        var bookingId = await SeedBookingAsync(
            status: BookingStatus.Pending,
            checkInDate: DateOnly.FromDateTime(DateTime.UtcNow.Date.AddDays(-1)));

        var expiredCount = await ExecuteScopeAsync(async services =>
        {
            var service = services.GetRequiredService<IBookingExpirationService>();
            return await service.ExpirePendingBookingsAsync();
        });

        expiredCount.ShouldBe(1);

        await ExecuteScopeAsync(async services =>
        {
            var context = services.GetRequiredService<ApplicationDbContext>();

            var booking = await context.Bookings.SingleAsync(x => x.Id == bookingId);
            booking.Status.ShouldBe(BookingStatus.Cancelled);
            booking.CancelledAt.ShouldNotBeNull();
            booking.CancellationReason.ShouldBe("Expired automatically because the check-in date has passed.");

            var auditLog = await context.AuditLogs
                .OrderByDescending(x => x.Id)
                .FirstOrDefaultAsync(x => x.EntityName == nameof(Booking) && x.EntityId == bookingId && x.Action == "Expired");

            auditLog.ShouldNotBeNull();
            auditLog.UserId.ShouldBe("system");
            auditLog.UserName.ShouldBe("hangfire");
            auditLog.AdditionalInfo.ShouldNotBeNull();
            auditLog.AdditionalInfo.ShouldContain("expiredBy=hangfire");
        });
    }

    [Test]
    public async Task ExpirePendingBookingsAsync_DoesNotCancelPendingBooking_WhenCheckInDateIsTodayOrLater()
    {
        var todayBookingId = await SeedBookingAsync(
            status: BookingStatus.Pending,
            checkInDate: DateOnly.FromDateTime(DateTime.UtcNow.Date));

        var futureBookingId = await SeedBookingAsync(
            status: BookingStatus.Pending,
            checkInDate: DateOnly.FromDateTime(DateTime.UtcNow.Date.AddDays(2)));

        var expiredCount = await ExecuteScopeAsync(async services =>
        {
            var service = services.GetRequiredService<IBookingExpirationService>();
            return await service.ExpirePendingBookingsAsync();
        });

        expiredCount.ShouldBe(0);

        await ExecuteScopeAsync(async services =>
        {
            var context = services.GetRequiredService<ApplicationDbContext>();

            var bookings = await context.Bookings
                .Where(x => x.Id == todayBookingId || x.Id == futureBookingId)
                .OrderBy(x => x.Id)
                .ToListAsync();

            bookings.Count.ShouldBe(2);
            bookings.All(x => x.Status == BookingStatus.Pending).ShouldBeTrue();

            var auditCount = await context.AuditLogs.CountAsync(x =>
                x.Action == "Expired" && (x.EntityId == todayBookingId || x.EntityId == futureBookingId));

            auditCount.ShouldBe(0);
        });
    }

    [Test]
    public async Task ExpirePendingBookingsAsync_DoesNotCancelNonPendingBooking_WhenCheckInDateHasPassed()
    {
        var bookingId = await SeedBookingAsync(
            status: BookingStatus.Confirmed,
            checkInDate: DateOnly.FromDateTime(DateTime.UtcNow.Date.AddDays(-1)));

        var expiredCount = await ExecuteScopeAsync(async services =>
        {
            var service = services.GetRequiredService<IBookingExpirationService>();
            return await service.ExpirePendingBookingsAsync();
        });

        expiredCount.ShouldBe(0);

        await ExecuteScopeAsync(async services =>
        {
            var context = services.GetRequiredService<ApplicationDbContext>();

            var booking = await context.Bookings.SingleAsync(x => x.Id == bookingId);
            booking.Status.ShouldBe(BookingStatus.Confirmed);

            var auditCount = await context.AuditLogs.CountAsync(x =>
                x.EntityId == bookingId && x.Action == "Expired");

            auditCount.ShouldBe(0);
        });
    }

    private static async Task<int> SeedBookingAsync(BookingStatus status, DateOnly checkInDate)
    {
        var bookingId = 0;

        await ExecuteDbContextAsync(async context =>
        {
            var hotel = new Hotel
            {
                Name = $"Expiration Hotel {Guid.NewGuid():N}",
                Description = "Expiration test hotel",
                Address = "San Salvador",
                City = "San Salvador",
                Country = "El Salvador",
                Email = $"expiration-hotel-{Guid.NewGuid():N}@example.com",
                PhoneNumber = "+50370000020",
                StarRating = 4,
                IsActive = true
            };

            context.Hotels.Add(hotel);
            await context.SaveChangesAsync();

            var roomType = new RoomType
            {
                HotelId = hotel.Id,
                Name = "Expiration Standard",
                Description = "Room for expiration tests",
                MaxOccupancy = 2,
                BasePrice = 150m,
                IsActive = true
            };

            context.RoomTypes.Add(roomType);
            await context.SaveChangesAsync();

            var guest = new Guest
            {
                FirstName = "Expired",
                LastName = "Guest",
                Email = $"expired-guest-{Guid.NewGuid():N}@example.com",
                PhoneNumber = "+50370000021"
            };

            var userEmail = $"expired-user-{Guid.NewGuid():N}@example.com";

            var user = new User
            {
                Email = userEmail,
                NormalizedEmail = userEmail.ToUpperInvariant(),
                FirstName = "Expired",
                LastName = "User",
                PasswordHash = "hashed-password",
                Role = UserRole.Customer
            };

            context.Guests.Add(guest);
            context.Users.Add(user);
            await context.SaveChangesAsync();

            var booking = new Booking
            {
                BookingNumber = $"EXP-{Guid.NewGuid():N}"[..18],
                UserId = user.Id,
                GuestId = guest.Id,
                RoomTypeId = roomType.Id,
                CheckInDate = checkInDate,
                CheckOutDate = checkInDate.AddDays(2),
                NumberOfGuests = 2,
                NumberOfRooms = 1,
                TotalAmount = 300m,
                Status = status,
                SpecialRequests = "Expiration test",
                Created = DateTimeOffset.UtcNow.AddDays(-3),
                CreatedBy = "test-seed",
                LastModified = DateTimeOffset.UtcNow.AddDays(-3),
                LastModifiedBy = "test-seed"
            };

            if (status == BookingStatus.Confirmed)
            {
                booking.ConfirmedAt = DateTimeOffset.UtcNow.AddDays(-2);
            }

            context.Bookings.Add(booking);
            await context.SaveChangesAsync();

            bookingId = booking.Id;
        });

        return bookingId;
    }
}

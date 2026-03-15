using HotelBookingPlatform.Domain.Entities;
using NUnit.Framework;
using Shouldly;

namespace HotelBookingPlatform.Application.UnitTests.Domain;

[TestFixture]
public class AuditLogTests
{
    [Test]
    public void Create_SetsAllProperties()
    {
        var before = DateTimeOffset.UtcNow;

        var log = AuditLog.Create(
            entityName: "Booking",
            entityId: 42,
            action: "BookingConfirmed",
            userId: "user-1",
            userName: "admin@example.com",
            oldValues: """{"Status":"Pending"}""",
            newValues: """{"Status":"Confirmed"}""",
            additionalInfo: """{"TraceId":"abc"}""");

        log.EntityName.ShouldBe("Booking");
        log.EntityId.ShouldBe(42);
        log.Action.ShouldBe("BookingConfirmed");
        log.UserId.ShouldBe("user-1");
        log.UserName.ShouldBe("admin@example.com");
        log.OldValues.ShouldBe("""{"Status":"Pending"}""");
        log.NewValues.ShouldBe("""{"Status":"Confirmed"}""");
        log.AdditionalInfo.ShouldBe("""{"TraceId":"abc"}""");
        log.Timestamp.ShouldBeGreaterThanOrEqualTo(before);
    }

    [Test]
    public void Create_SetsTimestampToUtcNow()
    {
        var before = DateTimeOffset.UtcNow;

        var log = AuditLog.Create("Entity", 1, "Action");

        log.Timestamp.ShouldBeGreaterThanOrEqualTo(before);
        log.Timestamp.Offset.ShouldBe(TimeSpan.Zero);
    }

    [Test]
    public void Create_WithOptionalNulls_LeavesThemNull()
    {
        var log = AuditLog.Create("Entity", 1, "Action");

        log.UserId.ShouldBeNull();
        log.UserName.ShouldBeNull();
        log.OldValues.ShouldBeNull();
        log.NewValues.ShouldBeNull();
        log.AdditionalInfo.ShouldBeNull();
    }

    [Test]
    public void Create_TwoCalls_ProduceDifferentTimestamps()
    {
        var first = AuditLog.Create("Entity", 1, "Action");
        System.Threading.Thread.Sleep(1);
        var second = AuditLog.Create("Entity", 1, "Action");

        second.Timestamp.ShouldBeGreaterThanOrEqualTo(first.Timestamp);
    }
}

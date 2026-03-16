using HotelBookingPlatform.Domain.Entities;
using NUnit.Framework;
using Shouldly;

namespace HotelBookingPlatform.Application.UnitTests.Domain;

[TestFixture]
public class IdempotencyRecordTests
{
    // --- Create ---

    [Test]
    public void Create_SetsRequiredProperties()
    {
        var before = DateTimeOffset.UtcNow;

        var record = IdempotencyRecord.Create("key-123", "/api/bookings", "hash-abc");

        record.IdempotencyKey.ShouldBe("key-123");
        record.RequestPath.ShouldBe("/api/bookings");
        record.RequestHash.ShouldBe("hash-abc");
        record.ResponseStatusCode.ShouldBe(0);
        record.ResponseBody.ShouldBe(string.Empty);
        record.CreatedAt.ShouldBeGreaterThanOrEqualTo(before);
    }

    [Test]
    public void Create_ExpiresInDefaultTwentyFourHours()
    {
        var before = DateTimeOffset.UtcNow;

        var record = IdempotencyRecord.Create("key", "/path");

        record.ExpiresAt.ShouldBeGreaterThanOrEqualTo(before.AddHours(24));
        record.ExpiresAt.ShouldBeLessThanOrEqualTo(before.AddHours(24).AddSeconds(5));
    }

    [Test]
    public void Create_CustomExpiration_SetsCorrectExpiresAt()
    {
        var before = DateTimeOffset.UtcNow;

        var record = IdempotencyRecord.Create("key", "/path", expirationHours: 48);

        record.ExpiresAt.ShouldBeGreaterThanOrEqualTo(before.AddHours(48));
    }

    // --- IsCompleted ---

    [Test]
    public void IsCompleted_WhenStatusCodeIsZero_ReturnsFalse()
    {
        var record = IdempotencyRecord.Create("key", "/path");

        record.IsCompleted().ShouldBeFalse();
    }

    [Test]
    public void IsCompleted_WhenStatusCodeIsNonZero_ReturnsTrue()
    {
        var record = IdempotencyRecord.CreateCompleted("key", "/path", 200, "{}");

        record.IsCompleted().ShouldBeTrue();
    }

    // --- IsExpired ---

    [Test]
    public void IsExpired_WhenExpiresAtIsInFuture_ReturnsFalse()
    {
        var record = IdempotencyRecord.Create("key", "/path");
        // ExpiresAt is 24 hours from now by default

        record.IsExpired().ShouldBeFalse();
    }

    [Test]
    public void IsExpired_WhenExpiresAtIsInPast_ReturnsTrue()
    {
        var record = IdempotencyRecord.Create("key", "/path");
        record.ExpiresAt = DateTimeOffset.UtcNow.AddSeconds(-1);

        record.IsExpired().ShouldBeTrue();
    }

    // --- Complete ---

    [Test]
    public void Complete_SetsAllResponseFields()
    {
        var record = IdempotencyRecord.Create("key", "/path");

        record.Complete(201, """{"id":1}""", "application/json", """{"X-Foo":"bar"}""", "/api/bookings/1");

        record.ResponseStatusCode.ShouldBe(201);
        record.ResponseBody.ShouldBe("""{"id":1}""");
        record.ResponseContentType.ShouldBe("application/json");
        record.ResponseHeadersJson.ShouldBe("""{"X-Foo":"bar"}""");
        record.ResourceLocation.ShouldBe("/api/bookings/1");
    }

    [Test]
    public void Complete_MakesRecordCompleted()
    {
        var record = IdempotencyRecord.Create("key", "/path");

        record.Complete(200, "{}", null, null, null);

        record.IsCompleted().ShouldBeTrue();
    }

    // --- CreateCompleted ---

    [Test]
    public void CreateCompleted_SetsAllProperties()
    {
        var before = DateTimeOffset.UtcNow;

        var record = IdempotencyRecord.CreateCompleted(
            "key-456", "/api/v1/bookings", 201, """{"id":5}""",
            requestHash: "h", responseContentType: "application/json",
            responseHeadersJson: "{}", resourceLocation: "/api/v1/bookings/5");

        record.IdempotencyKey.ShouldBe("key-456");
        record.RequestPath.ShouldBe("/api/v1/bookings");
        record.ResponseStatusCode.ShouldBe(201);
        record.ResponseBody.ShouldBe("""{"id":5}""");
        record.RequestHash.ShouldBe("h");
        record.ResponseContentType.ShouldBe("application/json");
        record.ResourceLocation.ShouldBe("/api/v1/bookings/5");
        record.IsCompleted().ShouldBeTrue();
        record.CreatedAt.ShouldBeGreaterThanOrEqualTo(before);
    }
}

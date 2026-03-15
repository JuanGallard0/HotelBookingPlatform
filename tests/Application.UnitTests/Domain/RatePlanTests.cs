using HotelBookingPlatform.Domain.Entities;
using NUnit.Framework;
using Shouldly;

namespace HotelBookingPlatform.Application.UnitTests.Domain;

[TestFixture]
public class RatePlanTests
{
    private static readonly DateOnly Jan1 = new(2025, 1, 1);
    private static readonly DateOnly Jan31 = new(2025, 1, 31);
    private static readonly DateOnly Feb15 = new(2025, 2, 15);

    private static RatePlan Create(
        decimal pricePerNight = 100m,
        decimal? discountPercentage = null,
        bool isActive = true,
        DateOnly? validFrom = null,
        DateOnly? validTo = null) => new()
    {
        RoomTypeId = 1,
        Name = "Standard Rate",
        Description = "Test",
        ValidFrom = validFrom ?? Jan1,
        ValidTo = validTo ?? Jan31,
        PricePerNight = pricePerNight,
        DiscountPercentage = discountPercentage,
        IsActive = isActive
    };

    // --- IsValidForDate ---

    [Test]
    public void IsValidForDate_ActiveAndWithinRange_ReturnsTrue()
    {
        var plan = Create();

        plan.IsValidForDate(new DateOnly(2025, 1, 15)).ShouldBeTrue();
    }

    [Test]
    public void IsValidForDate_OnValidFrom_ReturnsTrue()
    {
        var plan = Create();

        plan.IsValidForDate(Jan1).ShouldBeTrue();
    }

    [Test]
    public void IsValidForDate_OnValidTo_ReturnsTrue()
    {
        var plan = Create();

        plan.IsValidForDate(Jan31).ShouldBeTrue();
    }

    [Test]
    public void IsValidForDate_BeforeValidFrom_ReturnsFalse()
    {
        var plan = Create();

        plan.IsValidForDate(new DateOnly(2024, 12, 31)).ShouldBeFalse();
    }

    [Test]
    public void IsValidForDate_AfterValidTo_ReturnsFalse()
    {
        var plan = Create();

        plan.IsValidForDate(Feb15).ShouldBeFalse();
    }

    [Test]
    public void IsValidForDate_Inactiveplan_ReturnsFalse()
    {
        var plan = Create(isActive: false);

        plan.IsValidForDate(new DateOnly(2025, 1, 15)).ShouldBeFalse();
    }

    // --- GetEffectivePrice ---

    [Test]
    public void GetEffectivePrice_NoDiscount_ReturnsPricePerNight()
    {
        var plan = Create(pricePerNight: 100m, discountPercentage: null);

        plan.GetEffectivePrice().ShouldBe(100m);
    }

    [Test]
    public void GetEffectivePrice_ZeroDiscount_ReturnsPricePerNight()
    {
        var plan = Create(pricePerNight: 100m, discountPercentage: 0m);

        plan.GetEffectivePrice().ShouldBe(100m);
    }

    [Test]
    public void GetEffectivePrice_TenPercentDiscount_ReturnsNinetyPercent()
    {
        var plan = Create(pricePerNight: 200m, discountPercentage: 10m);

        plan.GetEffectivePrice().ShouldBe(180m);
    }

    [Test]
    public void GetEffectivePrice_FiftyPercentDiscount_ReturnsHalfPrice()
    {
        var plan = Create(pricePerNight: 100m, discountPercentage: 50m);

        plan.GetEffectivePrice().ShouldBe(50m);
    }

    [Test]
    public void GetEffectivePrice_HundredPercentDiscount_ReturnsZero()
    {
        var plan = Create(pricePerNight: 100m, discountPercentage: 100m);

        plan.GetEffectivePrice().ShouldBe(0m);
    }

    // --- CalculateTotalPrice ---

    [Test]
    public void CalculateTotalPrice_ThreeNights_ReturnsNightlyPriceTimesThree()
    {
        var plan = Create(pricePerNight: 100m);
        var checkIn = new DateOnly(2025, 1, 10);
        var checkOut = new DateOnly(2025, 1, 13);

        plan.CalculateTotalPrice(checkIn, checkOut).ShouldBe(300m);
    }

    [Test]
    public void CalculateTotalPrice_WithDiscount_AppliesDiscountPerNight()
    {
        var plan = Create(pricePerNight: 200m, discountPercentage: 25m);
        var checkIn = new DateOnly(2025, 1, 10);
        var checkOut = new DateOnly(2025, 1, 12); // 2 nights

        plan.CalculateTotalPrice(checkIn, checkOut).ShouldBe(300m); // 150 * 2
    }

    [Test]
    public void CalculateTotalPrice_CheckOutBeforeCheckIn_ThrowsArgumentException()
    {
        var plan = Create();

        Should.Throw<ArgumentException>(() =>
            plan.CalculateTotalPrice(Jan31, Jan1));
    }

    [Test]
    public void CalculateTotalPrice_CheckOutEqualsCheckIn_ThrowsArgumentException()
    {
        var plan = Create();

        Should.Throw<ArgumentException>(() =>
            plan.CalculateTotalPrice(Jan1, Jan1));
    }
}

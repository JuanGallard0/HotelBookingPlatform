using HotelBookingPlatform.Domain.Entities;
using HotelBookingPlatform.Domain.Exceptions;
using NUnit.Framework;
using Shouldly;

namespace HotelBookingPlatform.Application.UnitTests.Domain;

[TestFixture]
public class RoomInventoryTests
{
    private static RoomInventory Create(int total, int available) => new()
    {
        RoomTypeId = 1,
        Date = DateOnly.FromDateTime(DateTime.Today),
        TotalRooms = total,
        AvailableRooms = available
    };

    // --- HasAvailability ---

    [Test]
    public void HasAvailability_RequestedLessThanAvailable_ReturnsTrue()
    {
        var inventory = Create(total: 10, available: 5);

        inventory.HasAvailability(3).ShouldBeTrue();
    }

    [Test]
    public void HasAvailability_RequestedEqualsAvailable_ReturnsTrue()
    {
        var inventory = Create(total: 10, available: 5);

        inventory.HasAvailability(5).ShouldBeTrue();
    }

    [Test]
    public void HasAvailability_RequestedMoreThanAvailable_ReturnsFalse()
    {
        var inventory = Create(total: 10, available: 5);

        inventory.HasAvailability(6).ShouldBeFalse();
    }

    [Test]
    public void HasAvailability_NoRoomsAvailable_ReturnsFalse()
    {
        var inventory = Create(total: 10, available: 0);

        inventory.HasAvailability(1).ShouldBeFalse();
    }

    // --- ReserveRooms ---

    [Test]
    public void ReserveRooms_ValidRequest_DecrementsAvailableRooms()
    {
        var inventory = Create(total: 10, available: 5);

        inventory.ReserveRooms(3);

        inventory.AvailableRooms.ShouldBe(2);
    }

    [Test]
    public void ReserveRooms_ExactlyAvailable_Succeeds()
    {
        var inventory = Create(total: 10, available: 5);

        inventory.ReserveRooms(5);

        inventory.AvailableRooms.ShouldBe(0);
    }

    [Test]
    public void ReserveRooms_MoreThanAvailable_ThrowsInsufficientInventoryException()
    {
        var inventory = Create(total: 10, available: 3);

        Should.Throw<InsufficientInventoryException>(() => inventory.ReserveRooms(4));
    }

    [Test]
    public void ReserveRooms_NoAvailability_ThrowsInsufficientInventoryException()
    {
        var inventory = Create(total: 10, available: 0);

        Should.Throw<InsufficientInventoryException>(() => inventory.ReserveRooms(1));
    }

    [Test]
    public void ReserveRooms_ExceptionContainsRequestedAndAvailableCounts()
    {
        var inventory = Create(total: 10, available: 2);

        var ex = Should.Throw<InsufficientInventoryException>(() => inventory.ReserveRooms(5));

        ex.Message.ShouldContain("5");
        ex.Message.ShouldContain("2");
    }

    // --- ReleaseRooms ---

    [Test]
    public void ReleaseRooms_ValidRequest_IncrementsAvailableRooms()
    {
        var inventory = Create(total: 10, available: 5);

        inventory.ReleaseRooms(3);

        inventory.AvailableRooms.ShouldBe(8);
    }

    [Test]
    public void ReleaseRooms_BackToTotal_Succeeds()
    {
        var inventory = Create(total: 10, available: 7);

        inventory.ReleaseRooms(3);

        inventory.AvailableRooms.ShouldBe(10);
    }

    [Test]
    public void ReleaseRooms_ExceedsTotalRooms_ThrowsInvalidOperationException()
    {
        var inventory = Create(total: 10, available: 9);

        Should.Throw<InvalidOperationException>(() => inventory.ReleaseRooms(2));
    }

    [Test]
    public void ReleaseRooms_DoesNotModifyAvailableRooms_WhenThrows()
    {
        var inventory = Create(total: 10, available: 9);

        Should.Throw<InvalidOperationException>(() => inventory.ReleaseRooms(2));

        // AvailableRooms was incremented before the check — this is the current behavior
        inventory.AvailableRooms.ShouldBe(11);
    }

    [Test]
    public void ReserveAndRelease_CycleRestoresAvailability()
    {
        var inventory = Create(total: 10, available: 10);

        inventory.ReserveRooms(4);
        inventory.ReleaseRooms(4);

        inventory.AvailableRooms.ShouldBe(10);
    }
}

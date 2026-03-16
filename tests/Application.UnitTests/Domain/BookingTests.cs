using HotelBookingPlatform.Domain.Entities;
using HotelBookingPlatform.Domain.Enums;
using HotelBookingPlatform.Domain.Events;
using HotelBookingPlatform.Domain.Exceptions;
using NUnit.Framework;
using Shouldly;

namespace HotelBookingPlatform.Application.UnitTests.Domain;

[TestFixture]
public class BookingTests
{
    private static readonly DateOnly Today = new(2025, 6, 1);
    private static readonly DateOnly Tomorrow = Today.AddDays(1);
    private static readonly DateOnly NextWeek = Today.AddDays(7);

    private static Booking CreateValidBooking(
        DateOnly? checkIn = null,
        DateOnly? checkOut = null) =>
        Booking.Create(
            bookingNumber: "BKG-20250601-ABCD1234",
            userId: 1,
            guestId: 1,
            roomTypeId: 1,
            checkInDate: checkIn ?? Tomorrow,
            checkOutDate: checkOut ?? NextWeek,
            numberOfGuests: 2,
            numberOfRooms: 1,
            totalAmount: 350m,
            today: Today);

    // --- Create ---

    [Test]
    public void Create_ValidDates_ReturnsPendingBooking()
    {
        var booking = CreateValidBooking();

        booking.Status.ShouldBe(BookingStatus.Pending);
        booking.CheckInDate.ShouldBe(Tomorrow);
        booking.CheckOutDate.ShouldBe(NextWeek);
        booking.SpecialRequests.ShouldBeNull();
    }

    [Test]
    public void Create_WithSpecialRequests_SetsSpecialRequests()
    {
        var booking = Booking.Create("BKG-1", 1, 1, 1, Tomorrow, NextWeek, 2, 1, 350m, Today, "Late check-in");

        booking.SpecialRequests.ShouldBe("Late check-in");
    }

    [Test]
    public void Create_PublishesBookingCreatedEvent()
    {
        var booking = CreateValidBooking();

        booking.DomainEvents.ShouldContain(e => e is BookingCreatedEvent);
    }

    [Test]
    public void Create_CheckOutBeforeCheckIn_ThrowsInvalidBookingDatesException()
    {
        Should.Throw<InvalidBookingDatesException>(() =>
            CreateValidBooking(checkIn: NextWeek, checkOut: Tomorrow));
    }

    [Test]
    public void Create_CheckOutEqualsCheckIn_ThrowsInvalidBookingDatesException()
    {
        Should.Throw<InvalidBookingDatesException>(() =>
            CreateValidBooking(checkIn: Tomorrow, checkOut: Tomorrow));
    }

    [Test]
    public void Create_DurationExceedsMaxNights_ThrowsInvalidBookingDatesException()
    {
        var checkOut = Tomorrow.AddDays(Booking.MaximumNightsAllowed + 1);

        Should.Throw<InvalidBookingDatesException>(() =>
            CreateValidBooking(checkIn: Tomorrow, checkOut: checkOut));
    }

    [Test]
    public void Create_DurationExactlyMaxNights_Succeeds()
    {
        var checkOut = Tomorrow.AddDays(Booking.MaximumNightsAllowed);

        Should.NotThrow(() => CreateValidBooking(checkIn: Tomorrow, checkOut: checkOut));
    }

    [Test]
    public void Create_CheckInInPast_ThrowsInvalidBookingDatesException()
    {
        var yesterday = Today.AddDays(-1);

        Should.Throw<InvalidBookingDatesException>(() =>
            CreateValidBooking(checkIn: yesterday, checkOut: Today));
    }

    [Test]
    public void Create_CheckInToday_Succeeds()
    {
        Should.NotThrow(() =>
            CreateValidBooking(checkIn: Today, checkOut: Tomorrow));
    }

    // --- NumberOfNights ---

    [Test]
    public void NumberOfNights_ReturnsCorrectValue()
    {
        var booking = CreateValidBooking(checkIn: Tomorrow, checkOut: Tomorrow.AddDays(5));

        booking.NumberOfNights.ShouldBe(5);
    }

    // --- Confirm ---

    [Test]
    public void Confirm_PendingBooking_SetsConfirmedStatus()
    {
        var booking = CreateValidBooking();

        booking.Confirm();

        booking.Status.ShouldBe(BookingStatus.Confirmed);
    }

    [Test]
    public void Confirm_PendingBooking_SetsConfirmedAt()
    {
        var before = DateTimeOffset.UtcNow;
        var booking = CreateValidBooking();

        booking.Confirm();

        booking.ConfirmedAt.ShouldNotBeNull();
        booking.ConfirmedAt.Value.ShouldBeGreaterThanOrEqualTo(before);
    }

    [Test]
    public void Confirm_PendingBooking_PublishesBookingConfirmedEvent()
    {
        var booking = CreateValidBooking();

        booking.Confirm();

        booking.DomainEvents.ShouldContain(e => e is BookingConfirmedEvent);
    }

    [Test]
    public void Confirm_AlreadyConfirmed_ThrowsBookingStatusException()
    {
        var booking = CreateValidBooking();
        booking.Confirm();

        Should.Throw<BookingStatusException>(() => booking.Confirm());
    }

    [Test]
    public void Confirm_CancelledBooking_ThrowsBookingStatusException()
    {
        var booking = CreateValidBooking();
        booking.Cancel("test reason");

        Should.Throw<BookingStatusException>(() => booking.Confirm());
    }

    // --- Cancel ---

    [Test]
    public void Cancel_PendingBooking_SetsCancelledStatus()
    {
        var booking = CreateValidBooking();

        booking.Cancel("Changed plans");

        booking.Status.ShouldBe(BookingStatus.Cancelled);
    }

    [Test]
    public void Cancel_ConfirmedBooking_SetsCancelledStatus()
    {
        var booking = CreateValidBooking();
        booking.Confirm();

        booking.Cancel("Changed plans");

        booking.Status.ShouldBe(BookingStatus.Cancelled);
    }

    [Test]
    public void Cancel_SetsCancellationReason()
    {
        var booking = CreateValidBooking();

        booking.Cancel("Flight cancelled");

        booking.CancellationReason.ShouldBe("Flight cancelled");
    }

    [Test]
    public void Cancel_SetsCancelledAt()
    {
        var before = DateTimeOffset.UtcNow;
        var booking = CreateValidBooking();

        booking.Cancel("test");

        booking.CancelledAt.ShouldNotBeNull();
        booking.CancelledAt.Value.ShouldBeGreaterThanOrEqualTo(before);
    }

    [Test]
    public void Cancel_PublishesBookingCancelledEvent()
    {
        var booking = CreateValidBooking();

        booking.Cancel("test");

        booking.DomainEvents.ShouldContain(e => e is BookingCancelledEvent);
    }

    [Test]
    public void Cancel_AlreadyCancelled_ThrowsBookingStatusException()
    {
        var booking = CreateValidBooking();
        booking.Cancel("first reason");

        Should.Throw<BookingStatusException>(() => booking.Cancel("second reason"));
    }

    [Test]
    public void Cancel_CheckedOutBooking_ThrowsBookingStatusException()
    {
        var booking = CreateValidBooking();
        booking.Status = BookingStatus.CheckedOut;

        Should.Throw<BookingStatusException>(() => booking.Cancel("too late"));
    }
}

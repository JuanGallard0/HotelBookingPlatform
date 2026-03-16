namespace HotelBookingPlatform.Domain.UnitTests.Bookings;

public class BookingTests
{
    [Test]
    public void Create_ShouldInitializePendingBooking_AndRaiseBookingCreatedEvent()
    {
        var today = new DateOnly(2026, 3, 15);

        var booking = Booking.Create(
            bookingNumber: "BK-1001",
            userId: 10,
            guestId: 20,
            roomTypeId: 30,
            checkInDate: today.AddDays(2),
            checkOutDate: today.AddDays(5),
            numberOfGuests: 2,
            numberOfRooms: 1,
            totalAmount: 450m,
            today: today,
            specialRequests: "Late arrival");

        booking.Status.ShouldBe(BookingStatus.Pending);
        booking.NumberOfNights.ShouldBe(3);
        booking.SpecialRequests.ShouldBe("Late arrival");
        booking.DomainEvents.Count.ShouldBe(1);
        booking.DomainEvents.Single().ShouldBeOfType<BookingCreatedEvent>();
    }

    [Test]
    public void Confirm_ShouldSetConfirmedStatus_AndRaiseBookingConfirmedEvent()
    {
        var booking = CreatePendingBooking();

        booking.Confirm();

        booking.Status.ShouldBe(BookingStatus.Confirmed);
        booking.ConfirmedAt.ShouldNotBeNull();
        booking.DomainEvents.ShouldContain(e => e is BookingConfirmedEvent);
    }

    [Test]
    public void ValidateBookingDates_ShouldThrow_WhenStayExceedsMaximumAllowed()
    {
        var today = new DateOnly(2026, 3, 15);
        var booking = new Booking
        {
            CheckInDate = today.AddDays(1),
            CheckOutDate = today.AddDays(Booking.MaximumNightsAllowed + 2)
        };

        var action = () => booking.ValidateBookingDates(today);

        action.ShouldThrow<InvalidBookingDatesException>()
            .Message.ShouldContain(Booking.MaximumNightsAllowed.ToString());
    }

    private static Booking CreatePendingBooking()
    {
        var today = new DateOnly(2026, 3, 15);

        return Booking.Create(
            bookingNumber: "BK-1002",
            userId: 10,
            guestId: 20,
            roomTypeId: 30,
            checkInDate: today.AddDays(2),
            checkOutDate: today.AddDays(4),
            numberOfGuests: 2,
            numberOfRooms: 1,
            totalAmount: 300m,
            today: today);
    }
}

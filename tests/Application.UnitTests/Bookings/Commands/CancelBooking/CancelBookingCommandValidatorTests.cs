using HotelBookingPlatform.Application.Bookings.Commands.CancelBooking;
using NUnit.Framework;
using Shouldly;

namespace HotelBookingPlatform.Application.UnitTests.Bookings.Commands.CancelBooking;

[TestFixture]
public class CancelBookingCommandValidatorTests
{
    private readonly CancelBookingCommandValidator _validator = new();

    [Test]
    public void Should_Pass_When_Command_Is_Valid()
    {
        var command = new CancelBookingCommand(1, "Flight cancelled");

        var result = _validator.Validate(command);

        result.IsValid.ShouldBeTrue();
    }

    // --- BookingId ---

    [Test]
    public void Should_Fail_When_BookingId_Is_Zero()
    {
        var command = new CancelBookingCommand(0, "reason");

        var result = _validator.Validate(command);

        result.IsValid.ShouldBeFalse();
        result.Errors.ShouldContain(e => e.PropertyName == nameof(command.BookingId));
    }

    [Test]
    public void Should_Fail_When_BookingId_Is_Negative()
    {
        var command = new CancelBookingCommand(-5, "reason");

        var result = _validator.Validate(command);

        result.IsValid.ShouldBeFalse();
        result.Errors.ShouldContain(e => e.PropertyName == nameof(command.BookingId));
    }

    // --- Reason ---

    [Test]
    public void Should_Fail_When_Reason_Is_Empty()
    {
        var command = new CancelBookingCommand(1, "");

        var result = _validator.Validate(command);

        result.IsValid.ShouldBeFalse();
        result.Errors.ShouldContain(e => e.PropertyName == nameof(command.Reason));
    }

    [Test]
    public void Should_Fail_When_Reason_Is_Whitespace()
    {
        var command = new CancelBookingCommand(1, "   ");

        var result = _validator.Validate(command);

        result.IsValid.ShouldBeFalse();
        result.Errors.ShouldContain(e => e.PropertyName == nameof(command.Reason));
    }

    [Test]
    public void Should_Fail_When_Reason_Exceeds_500_Chars()
    {
        var command = new CancelBookingCommand(1, new string('x', 501));

        var result = _validator.Validate(command);

        result.IsValid.ShouldBeFalse();
        result.Errors.ShouldContain(e => e.PropertyName == nameof(command.Reason));
    }

    [Test]
    public void Should_Pass_When_Reason_Is_Exactly_500_Chars()
    {
        var command = new CancelBookingCommand(1, new string('x', 500));

        var result = _validator.Validate(command);

        result.IsValid.ShouldBeTrue();
    }
}

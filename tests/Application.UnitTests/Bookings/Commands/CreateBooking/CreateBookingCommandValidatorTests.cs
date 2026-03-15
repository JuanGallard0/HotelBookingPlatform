using HotelBookingPlatform.Application.Bookings.Commands.CreateBooking;
using Moq;
using NUnit.Framework;
using Shouldly;

namespace HotelBookingPlatform.Application.UnitTests.Bookings.Commands.CreateBooking;

[TestFixture]
public class CreateBookingCommandValidatorTests
{
    private CreateBookingCommandValidator _validator = null!;
    private static readonly DateOnly Today = new(2025, 6, 1);
    private static readonly DateOnly Tomorrow = Today.AddDays(1);
    private static readonly DateOnly NextWeek = Today.AddDays(7);

    [SetUp]
    public void SetUp()
    {
        var timeProvider = new Mock<TimeProvider>();
        timeProvider.Setup(t => t.GetUtcNow())
            .Returns(new DateTimeOffset(Today.Year, Today.Month, Today.Day, 12, 0, 0, TimeSpan.FromHours(-6)));

        _validator = new CreateBookingCommandValidator(timeProvider.Object);
    }

    private static GuestInfoDto ValidGuest() =>
        new("John", "Doe", "john@example.com", "+50312345678");

    private CreateBookingCommand ValidCommand() => new()
    {
        RoomTypeId = 1,
        CheckIn = Tomorrow,
        CheckOut = NextWeek,
        NumberOfGuests = 2,
        NumberOfRooms = 1,
        Guest = ValidGuest()
    };

    // --- happy path ---

    [Test]
    public void Should_Pass_When_Command_Is_Valid()
    {
        var result = _validator.Validate(ValidCommand());

        result.IsValid.ShouldBeTrue();
    }

    // --- RoomTypeId ---

    [Test]
    public void Should_Fail_When_RoomTypeId_Is_Zero()
    {
        var command = ValidCommand() with { RoomTypeId = 0 };

        var result = _validator.Validate(command);

        result.IsValid.ShouldBeFalse();
        result.Errors.ShouldContain(e => e.PropertyName == nameof(command.RoomTypeId));
    }

    [Test]
    public void Should_Fail_When_RoomTypeId_Is_Negative()
    {
        var command = ValidCommand() with { RoomTypeId = -1 };

        var result = _validator.Validate(command);

        result.IsValid.ShouldBeFalse();
        result.Errors.ShouldContain(e => e.PropertyName == nameof(command.RoomTypeId));
    }

    // --- CheckIn ---

    [Test]
    public void Should_Pass_When_CheckIn_Is_Today()
    {
        var command = ValidCommand() with { CheckIn = Today, CheckOut = Tomorrow };

        var result = _validator.Validate(command);

        result.IsValid.ShouldBeTrue();
    }

    [Test]
    public void Should_Fail_When_CheckIn_Is_In_Past()
    {
        var command = ValidCommand() with { CheckIn = Today.AddDays(-1), CheckOut = Today };

        var result = _validator.Validate(command);

        result.IsValid.ShouldBeFalse();
        result.Errors.ShouldContain(e => e.PropertyName == nameof(command.CheckIn));
    }

    // --- CheckOut ---

    [Test]
    public void Should_Fail_When_CheckOut_Equals_CheckIn()
    {
        var command = ValidCommand() with { CheckIn = Tomorrow, CheckOut = Tomorrow };

        var result = _validator.Validate(command);

        result.IsValid.ShouldBeFalse();
        result.Errors.ShouldContain(e => e.PropertyName == nameof(command.CheckOut));
    }

    [Test]
    public void Should_Fail_When_CheckOut_Is_Before_CheckIn()
    {
        var command = ValidCommand() with { CheckIn = NextWeek, CheckOut = Tomorrow };

        var result = _validator.Validate(command);

        result.IsValid.ShouldBeFalse();
        result.Errors.ShouldContain(e => e.PropertyName == nameof(command.CheckOut));
    }

    // --- Duration ---

    [Test]
    public void Should_Fail_When_Duration_Exceeds_30_Nights()
    {
        var command = ValidCommand() with
        {
            CheckIn = Tomorrow,
            CheckOut = Tomorrow.AddDays(31)
        };

        var result = _validator.Validate(command);

        result.IsValid.ShouldBeFalse();
    }

    [Test]
    public void Should_Pass_When_Duration_Is_Exactly_30_Nights()
    {
        var command = ValidCommand() with
        {
            CheckIn = Tomorrow,
            CheckOut = Tomorrow.AddDays(30)
        };

        var result = _validator.Validate(command);

        result.IsValid.ShouldBeTrue();
    }

    // --- Guests / Rooms ---

    [Test]
    public void Should_Fail_When_NumberOfGuests_Is_Zero()
    {
        var command = ValidCommand() with { NumberOfGuests = 0 };

        var result = _validator.Validate(command);

        result.IsValid.ShouldBeFalse();
        result.Errors.ShouldContain(e => e.PropertyName == nameof(command.NumberOfGuests));
    }

    [Test]
    public void Should_Fail_When_NumberOfRooms_Is_Zero()
    {
        var command = ValidCommand() with { NumberOfRooms = 0 };

        var result = _validator.Validate(command);

        result.IsValid.ShouldBeFalse();
        result.Errors.ShouldContain(e => e.PropertyName == nameof(command.NumberOfRooms));
    }

    // --- Guest info ---

    [Test]
    public void Should_Fail_When_Guest_Is_Null()
    {
        var command = ValidCommand() with { Guest = null! };

        var result = _validator.Validate(command);

        result.IsValid.ShouldBeFalse();
        result.Errors.ShouldContain(e => e.PropertyName == nameof(command.Guest));
    }

    [Test]
    public void Should_Fail_When_Guest_FirstName_Is_Empty()
    {
        var command = ValidCommand() with { Guest = ValidGuest() with { FirstName = "" } };

        var result = _validator.Validate(command);

        result.IsValid.ShouldBeFalse();
        result.Errors.ShouldContain(e => e.PropertyName.EndsWith(nameof(GuestInfoDto.FirstName)));
    }

    [Test]
    public void Should_Fail_When_Guest_LastName_Is_Empty()
    {
        var command = ValidCommand() with { Guest = ValidGuest() with { LastName = "" } };

        var result = _validator.Validate(command);

        result.IsValid.ShouldBeFalse();
        result.Errors.ShouldContain(e => e.PropertyName.EndsWith(nameof(GuestInfoDto.LastName)));
    }

    [Test]
    public void Should_Fail_When_Guest_Email_Is_Invalid()
    {
        var command = ValidCommand() with { Guest = ValidGuest() with { Email = "not-an-email" } };

        var result = _validator.Validate(command);

        result.IsValid.ShouldBeFalse();
        result.Errors.ShouldContain(e => e.PropertyName.EndsWith(nameof(GuestInfoDto.Email)));
    }

    [Test]
    public void Should_Fail_When_Guest_PhoneNumber_Is_Empty()
    {
        var command = ValidCommand() with { Guest = ValidGuest() with { PhoneNumber = "" } };

        var result = _validator.Validate(command);

        result.IsValid.ShouldBeFalse();
        result.Errors.ShouldContain(e => e.PropertyName.EndsWith(nameof(GuestInfoDto.PhoneNumber)));
    }

    [Test]
    public void Should_Fail_When_Guest_FirstName_Exceeds_100_Chars()
    {
        var command = ValidCommand() with
        {
            Guest = ValidGuest() with { FirstName = new string('A', 101) }
        };

        var result = _validator.Validate(command);

        result.IsValid.ShouldBeFalse();
        result.Errors.ShouldContain(e => e.PropertyName.EndsWith(nameof(GuestInfoDto.FirstName)));
    }
}

using HotelBookingPlatform.Application.Hotels.Commands.CreateRatePlan;
using NUnit.Framework;
using Shouldly;

namespace HotelBookingPlatform.Application.UnitTests.Hotels.Commands;

[TestFixture]
public class CreateRatePlanCommandValidatorTests
{
    private readonly CreateRatePlanCommandValidator _validator = new();

    private static readonly DateOnly Jan1 = new(2025, 1, 1);
    private static readonly DateOnly Jan31 = new(2025, 1, 31);

    private static CreateRatePlanCommand ValidCommand() => new(
        Name: "Standard Rate",
        Description: "Default nightly rate",
        ValidFrom: Jan1,
        ValidTo: Jan31,
        PricePerNight: 120m,
        DiscountPercentage: null,
        IsActive: true)
    {
        RoomTypeId = 1
    };

    // --- happy path ---

    [Test]
    public void Should_Pass_When_Command_Is_Valid()
    {
        var result = _validator.Validate(ValidCommand());

        result.IsValid.ShouldBeTrue();
    }

    [Test]
    public void Should_Pass_When_DiscountPercentage_Is_Null()
    {
        var command = ValidCommand() with { DiscountPercentage = null };

        var result = _validator.Validate(command);

        result.IsValid.ShouldBeTrue();
    }

    [Test]
    public void Should_Pass_When_ValidTo_Equals_ValidFrom()
    {
        var command = ValidCommand() with { ValidFrom = Jan1, ValidTo = Jan1 };

        var result = _validator.Validate(command);

        result.IsValid.ShouldBeTrue();
    }

    [Test]
    public void Should_Pass_When_PricePerNight_Is_Zero()
    {
        var command = ValidCommand() with { PricePerNight = 0m };

        var result = _validator.Validate(command);

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

    // --- Name ---

    [Test]
    public void Should_Fail_When_Name_Is_Empty()
    {
        var command = ValidCommand() with { Name = "" };

        var result = _validator.Validate(command);

        result.IsValid.ShouldBeFalse();
        result.Errors.ShouldContain(e => e.PropertyName == nameof(command.Name));
    }

    [Test]
    public void Should_Fail_When_Name_Exceeds_100_Chars()
    {
        var command = ValidCommand() with { Name = new string('A', 101) };

        var result = _validator.Validate(command);

        result.IsValid.ShouldBeFalse();
        result.Errors.ShouldContain(e => e.PropertyName == nameof(command.Name));
    }

    // --- ValidTo ---

    [Test]
    public void Should_Fail_When_ValidTo_Is_Before_ValidFrom()
    {
        var command = ValidCommand() with { ValidFrom = Jan31, ValidTo = Jan1 };

        var result = _validator.Validate(command);

        result.IsValid.ShouldBeFalse();
        result.Errors.ShouldContain(e => e.PropertyName == nameof(command.ValidTo));
    }

    // --- PricePerNight ---

    [Test]
    public void Should_Fail_When_PricePerNight_Is_Negative()
    {
        var command = ValidCommand() with { PricePerNight = -1m };

        var result = _validator.Validate(command);

        result.IsValid.ShouldBeFalse();
        result.Errors.ShouldContain(e => e.PropertyName == nameof(command.PricePerNight));
    }

    // --- DiscountPercentage ---

    [TestCase(0)]
    [TestCase(50)]
    [TestCase(100)]
    public void Should_Pass_When_DiscountPercentage_Is_Valid(decimal discount)
    {
        var command = ValidCommand() with { DiscountPercentage = discount };

        var result = _validator.Validate(command);

        result.IsValid.ShouldBeTrue();
    }

    [Test]
    public void Should_Fail_When_DiscountPercentage_Is_Negative()
    {
        var command = ValidCommand() with { DiscountPercentage = -1m };

        var result = _validator.Validate(command);

        result.IsValid.ShouldBeFalse();
        result.Errors.ShouldContain(e => e.PropertyName == nameof(command.DiscountPercentage));
    }

    [Test]
    public void Should_Fail_When_DiscountPercentage_Exceeds_100()
    {
        var command = ValidCommand() with { DiscountPercentage = 101m };

        var result = _validator.Validate(command);

        result.IsValid.ShouldBeFalse();
        result.Errors.ShouldContain(e => e.PropertyName == nameof(command.DiscountPercentage));
    }

    // --- Description max length ---

    [Test]
    public void Should_Fail_When_Description_Exceeds_1000_Chars()
    {
        var command = ValidCommand() with { Description = new string('x', 1001) };

        var result = _validator.Validate(command);

        result.IsValid.ShouldBeFalse();
        result.Errors.ShouldContain(e => e.PropertyName == nameof(command.Description));
    }
}

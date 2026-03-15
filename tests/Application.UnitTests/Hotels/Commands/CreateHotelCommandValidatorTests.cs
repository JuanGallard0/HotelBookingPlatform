using HotelBookingPlatform.Application.Hotels.Commands.CreateHotel;
using NUnit.Framework;
using Shouldly;

namespace HotelBookingPlatform.Application.UnitTests.Hotels.Commands;

[TestFixture]
public class CreateHotelCommandValidatorTests
{
    private readonly CreateHotelCommandValidator _validator = new();

    private static CreateHotelCommand ValidCommand() => new(
        Name: "Grand Hotel",
        Description: "A wonderful hotel in the city center.",
        Address: "123 Main Street",
        City: "San Salvador",
        Country: "El Salvador",
        Email: "info@grandhotel.com",
        PhoneNumber: "+50322334455",
        StarRating: 4);

    // --- happy path ---

    [Test]
    public void Should_Pass_When_Command_Is_Valid()
    {
        var result = _validator.Validate(ValidCommand());

        result.IsValid.ShouldBeTrue();
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
    public void Should_Fail_When_Name_Exceeds_200_Chars()
    {
        var command = ValidCommand() with { Name = new string('A', 201) };

        var result = _validator.Validate(command);

        result.IsValid.ShouldBeFalse();
        result.Errors.ShouldContain(e => e.PropertyName == nameof(command.Name));
    }

    // --- Description ---

    [Test]
    public void Should_Fail_When_Description_Is_Empty()
    {
        var command = ValidCommand() with { Description = "" };

        var result = _validator.Validate(command);

        result.IsValid.ShouldBeFalse();
        result.Errors.ShouldContain(e => e.PropertyName == nameof(command.Description));
    }

    // --- Email ---

    [Test]
    public void Should_Fail_When_Email_Is_Empty()
    {
        var command = ValidCommand() with { Email = "" };

        var result = _validator.Validate(command);

        result.IsValid.ShouldBeFalse();
        result.Errors.ShouldContain(e => e.PropertyName == nameof(command.Email));
    }

    [Test]
    public void Should_Fail_When_Email_Is_Invalid()
    {
        var command = ValidCommand() with { Email = "not-an-email" };

        var result = _validator.Validate(command);

        result.IsValid.ShouldBeFalse();
        result.Errors.ShouldContain(e => e.PropertyName == nameof(command.Email));
    }

    // --- PhoneNumber ---

    [Test]
    public void Should_Fail_When_PhoneNumber_Is_Empty()
    {
        var command = ValidCommand() with { PhoneNumber = "" };

        var result = _validator.Validate(command);

        result.IsValid.ShouldBeFalse();
        result.Errors.ShouldContain(e => e.PropertyName == nameof(command.PhoneNumber));
    }

    [Test]
    public void Should_Fail_When_PhoneNumber_Exceeds_20_Chars()
    {
        var command = ValidCommand() with { PhoneNumber = new string('1', 21) };

        var result = _validator.Validate(command);

        result.IsValid.ShouldBeFalse();
        result.Errors.ShouldContain(e => e.PropertyName == nameof(command.PhoneNumber));
    }

    // --- StarRating ---

    [TestCase(1)]
    [TestCase(3)]
    [TestCase(5)]
    public void Should_Pass_When_StarRating_Is_Between_1_And_5(int rating)
    {
        var command = ValidCommand() with { StarRating = rating };

        var result = _validator.Validate(command);

        result.IsValid.ShouldBeTrue();
    }

    [Test]
    public void Should_Fail_When_StarRating_Is_Zero()
    {
        var command = ValidCommand() with { StarRating = 0 };

        var result = _validator.Validate(command);

        result.IsValid.ShouldBeFalse();
        result.Errors.ShouldContain(e => e.PropertyName == nameof(command.StarRating));
    }

    [Test]
    public void Should_Fail_When_StarRating_Is_6()
    {
        var command = ValidCommand() with { StarRating = 6 };

        var result = _validator.Validate(command);

        result.IsValid.ShouldBeFalse();
        result.Errors.ShouldContain(e => e.PropertyName == nameof(command.StarRating));
    }

    [Test]
    public void Should_Fail_When_StarRating_Is_Negative()
    {
        var command = ValidCommand() with { StarRating = -1 };

        var result = _validator.Validate(command);

        result.IsValid.ShouldBeFalse();
        result.Errors.ShouldContain(e => e.PropertyName == nameof(command.StarRating));
    }

    // --- Location fields ---

    [Test]
    public void Should_Fail_When_City_Is_Empty()
    {
        var command = ValidCommand() with { City = "" };

        var result = _validator.Validate(command);

        result.IsValid.ShouldBeFalse();
        result.Errors.ShouldContain(e => e.PropertyName == nameof(command.City));
    }

    [Test]
    public void Should_Fail_When_Country_Is_Empty()
    {
        var command = ValidCommand() with { Country = "" };

        var result = _validator.Validate(command);

        result.IsValid.ShouldBeFalse();
        result.Errors.ShouldContain(e => e.PropertyName == nameof(command.Country));
    }

    [Test]
    public void Should_Fail_When_Address_Is_Empty()
    {
        var command = ValidCommand() with { Address = "" };

        var result = _validator.Validate(command);

        result.IsValid.ShouldBeFalse();
        result.Errors.ShouldContain(e => e.PropertyName == nameof(command.Address));
    }
}

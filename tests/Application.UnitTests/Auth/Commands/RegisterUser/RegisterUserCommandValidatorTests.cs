using HotelBookingPlatform.Application.Auth.Commands.RegisterUser;
using NUnit.Framework;
using Shouldly;

namespace HotelBookingPlatform.Application.UnitTests.Auth.Commands.RegisterUser;

public class RegisterUserCommandValidatorTests
{
    private readonly RegisterUserCommandValidator _validator = new();

    [Test]
    public void Should_Pass_When_Command_Is_Valid()
    {
        var command = new RegisterUserCommand(
            "guest@example.com",
            "Demo",
            "Guest",
            "StrongPass1");

        var result = _validator.Validate(command);

        result.IsValid.ShouldBeTrue();
    }

    [Test]
    public void Should_Fail_When_Password_Is_Weak()
    {
        var command = new RegisterUserCommand(
            "guest@example.com",
            "Demo",
            "Guest",
            "weak");

        var result = _validator.Validate(command);

        result.IsValid.ShouldBeFalse();
        result.Errors.Any(x => x.PropertyName == nameof(RegisterUserCommand.Password)).ShouldBeTrue();
    }
}

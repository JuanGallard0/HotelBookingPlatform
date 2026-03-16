using HotelBookingPlatform.Application.Auth.Commands.LoginUser;
using NUnit.Framework;
using Shouldly;

namespace HotelBookingPlatform.Application.UnitTests.Auth.Commands.LoginUser;

public class LoginUserCommandValidatorTests
{
    private readonly LoginUserCommandValidator _validator = new();

    [Test]
    public void Should_Pass_When_Command_Is_Valid()
    {
        var command = new LoginUserCommand("guest@example.com", "StrongPass1");

        var result = _validator.Validate(command);

        result.IsValid.ShouldBeTrue();
    }

    [Test]
    public void Should_Fail_When_Email_Is_Invalid()
    {
        var command = new LoginUserCommand("not-an-email", "StrongPass1");

        var result = _validator.Validate(command);

        result.IsValid.ShouldBeFalse();
        result.Errors.Any(x => x.PropertyName == nameof(LoginUserCommand.Email)).ShouldBeTrue();
    }
}

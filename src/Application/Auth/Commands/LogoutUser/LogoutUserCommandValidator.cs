namespace HotelBookingPlatform.Application.Auth.Commands.LogoutUser;

public class LogoutUserCommandValidator : AbstractValidator<LogoutUserCommand>
{
    public LogoutUserCommandValidator()
    {
        RuleFor(x => x.RefreshToken)
            .NotEmpty()
            .MaximumLength(512);
    }
}

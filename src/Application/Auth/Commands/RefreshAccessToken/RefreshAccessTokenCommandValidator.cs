namespace HotelBookingPlatform.Application.Auth.Commands.RefreshAccessToken;

public class RefreshAccessTokenCommandValidator : AbstractValidator<RefreshAccessTokenCommand>
{
    public RefreshAccessTokenCommandValidator()
    {
        RuleFor(x => x.RefreshToken)
            .NotEmpty()
            .MaximumLength(512);
    }
}

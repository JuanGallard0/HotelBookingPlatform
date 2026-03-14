namespace HotelBookingPlatform.Application.Auth.Commands.RefreshAccessToken;

public class RefreshAccessTokenCommandValidator : AbstractValidator<RefreshAccessTokenCommand>
{
    public RefreshAccessTokenCommandValidator()
    {
        RuleFor(x => x.RefreshToken)
            .NotEmpty().WithMessage("El token de actualización es obligatorio.")
            .MaximumLength(512).WithMessage("El token de actualización no debe exceder los 512 caracteres.");
    }
}

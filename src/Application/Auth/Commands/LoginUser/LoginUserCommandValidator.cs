namespace HotelBookingPlatform.Application.Auth.Commands.LoginUser;

public class LoginUserCommandValidator : AbstractValidator<LoginUserCommand>
{
    public LoginUserCommandValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("El correo electrónico es obligatorio.")
            .EmailAddress().WithMessage("El correo electrónico debe ser una dirección válida.")
            .MaximumLength(256).WithMessage("El correo electrónico no debe exceder los 256 caracteres.");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("La contraseña es obligatoria.")
            .MaximumLength(128).WithMessage("La contraseña no debe exceder los 128 caracteres.");
    }
}

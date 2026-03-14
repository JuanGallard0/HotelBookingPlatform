namespace HotelBookingPlatform.Application.Hotels.Commands.CreateHotel;

public class CreateHotelCommandValidator : AbstractValidator<CreateHotelCommand>
{
    public CreateHotelCommandValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("El nombre es obligatorio.")
            .MaximumLength(200).WithMessage("El nombre no debe exceder los 200 caracteres.");

        RuleFor(x => x.Description)
            .NotEmpty().WithMessage("La descripción es obligatoria.")
            .MaximumLength(2000).WithMessage("La descripción no debe exceder los 2000 caracteres.");

        RuleFor(x => x.Address)
            .NotEmpty().WithMessage("La dirección es obligatoria.")
            .MaximumLength(500).WithMessage("La dirección no debe exceder los 500 caracteres.");

        RuleFor(x => x.City)
            .NotEmpty().WithMessage("La ciudad es obligatoria.")
            .MaximumLength(100).WithMessage("La ciudad no debe exceder los 100 caracteres.");

        RuleFor(x => x.Country)
            .NotEmpty().WithMessage("El país es obligatorio.")
            .MaximumLength(100).WithMessage("El país no debe exceder los 100 caracteres.");

        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("El correo electrónico es obligatorio.")
            .EmailAddress().WithMessage("El correo electrónico debe ser una dirección válida.")
            .MaximumLength(200).WithMessage("El correo electrónico no debe exceder los 200 caracteres.");

        RuleFor(x => x.PhoneNumber)
            .NotEmpty().WithMessage("El número de teléfono es obligatorio.")
            .MaximumLength(20).WithMessage("El número de teléfono no debe exceder los 20 caracteres.");

        RuleFor(x => x.StarRating)
            .InclusiveBetween(1, 5).WithMessage("La calificación de estrellas debe estar entre 1 y 5.");
    }
}

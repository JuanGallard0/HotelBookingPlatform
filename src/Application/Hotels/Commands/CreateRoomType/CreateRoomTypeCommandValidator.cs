namespace HotelBookingPlatform.Application.Hotels.Commands.CreateRoomType;

public class CreateRoomTypeCommandValidator : AbstractValidator<CreateRoomTypeCommand>
{
    public CreateRoomTypeCommandValidator()
    {
        RuleFor(x => x.HotelId)
            .GreaterThan(0).WithMessage("El id del hotel debe ser mayor que 0.");

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("El nombre es obligatorio.")
            .MaximumLength(100).WithMessage("El nombre no debe exceder los 100 caracteres.");

        RuleFor(x => x.Description)
            .MaximumLength(1000).WithMessage("La descripción no debe exceder los 1000 caracteres.");

        RuleFor(x => x.MaxOccupancy)
            .GreaterThan(0).WithMessage("La ocupación máxima debe ser mayor que 0.");

        RuleFor(x => x.BasePrice)
            .GreaterThanOrEqualTo(0).WithMessage("El precio base debe ser mayor o igual a 0.");
    }
}

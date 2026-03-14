namespace HotelBookingPlatform.Application.Hotels.Commands.UpdateRatePlan;

public class UpdateRatePlanCommandValidator : AbstractValidator<UpdateRatePlanCommand>
{
    public UpdateRatePlanCommandValidator()
    {
        RuleFor(x => x.RatePlanId)
            .GreaterThan(0).WithMessage("El id del plan de tarifas debe ser mayor que 0.");

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("El nombre es obligatorio.")
            .MaximumLength(100).WithMessage("El nombre no debe exceder los 100 caracteres.");

        RuleFor(x => x.Description)
            .MaximumLength(1000).WithMessage("La descripción no debe exceder los 1000 caracteres.");

        RuleFor(x => x.ValidTo)
            .GreaterThanOrEqualTo(x => x.ValidFrom)
            .WithMessage("La fecha de fin debe ser mayor o igual a la fecha de inicio.");

        RuleFor(x => x.PricePerNight)
            .GreaterThanOrEqualTo(0).WithMessage("El precio por noche debe ser mayor o igual a 0.");

        RuleFor(x => x.DiscountPercentage)
            .InclusiveBetween(0, 100)
            .When(x => x.DiscountPercentage.HasValue)
            .WithMessage("El porcentaje de descuento debe estar entre 0 y 100.");
    }
}

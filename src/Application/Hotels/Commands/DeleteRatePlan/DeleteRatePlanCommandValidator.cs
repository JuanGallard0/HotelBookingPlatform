namespace HotelBookingPlatform.Application.Hotels.Commands.DeleteRatePlan;

public class DeleteRatePlanCommandValidator : AbstractValidator<DeleteRatePlanCommand>
{
    public DeleteRatePlanCommandValidator()
    {
        RuleFor(x => x.RatePlanId)
            .GreaterThan(0).WithMessage("El id del plan de tarifas debe ser mayor que 0.");
    }
}

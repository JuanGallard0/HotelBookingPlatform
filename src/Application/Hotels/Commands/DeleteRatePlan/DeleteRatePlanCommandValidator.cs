namespace HotelBookingPlatform.Application.Hotels.Commands.DeleteRatePlan;

public class DeleteRatePlanCommandValidator : AbstractValidator<DeleteRatePlanCommand>
{
    public DeleteRatePlanCommandValidator()
    {
        RuleFor(x => x.RatePlanId)
            .GreaterThan(0).WithMessage("Rate plan id must be greater than 0.");
    }
}

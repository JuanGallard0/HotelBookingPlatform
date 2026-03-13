namespace HotelBookingPlatform.Application.Hotels.Commands.CreateRatePlan;

public class CreateRatePlanCommandValidator : AbstractValidator<CreateRatePlanCommand>
{
    public CreateRatePlanCommandValidator()
    {
        RuleFor(x => x.RoomTypeId)
            .GreaterThan(0).WithMessage("Room type id must be greater than 0.");

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Name is required.")
            .MaximumLength(100).WithMessage("Name must not exceed 100 characters.");

        RuleFor(x => x.Description)
            .MaximumLength(1000).WithMessage("Description must not exceed 1000 characters.");

        RuleFor(x => x.ValidTo)
            .GreaterThanOrEqualTo(x => x.ValidFrom)
            .WithMessage("Valid to must be greater than or equal to valid from.");

        RuleFor(x => x.PricePerNight)
            .GreaterThanOrEqualTo(0).WithMessage("Price per night must be greater than or equal to 0.");

        RuleFor(x => x.DiscountPercentage)
            .InclusiveBetween(0, 100)
            .When(x => x.DiscountPercentage.HasValue)
            .WithMessage("Discount percentage must be between 0 and 100.");
    }
}

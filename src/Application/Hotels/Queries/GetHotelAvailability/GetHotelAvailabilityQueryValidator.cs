namespace HotelBookingPlatform.Application.Hotels.Queries.GetHotelAvailability;

public class GetHotelAvailabilityQueryValidator : AbstractValidator<GetHotelAvailabilityQuery>
{
    public GetHotelAvailabilityQueryValidator(TimeProvider timeProvider)
    {
        RuleFor(x => x.CheckIn)
            .NotNull()
            .WithMessage("Check-in date is required.");

        RuleFor(x => x.CheckOut)
            .NotNull()
            .WithMessage("Check-out date is required.");

        RuleFor(x => x.NumberOfGuests)
            .GreaterThan(0)
            .When(x => x.NumberOfGuests.HasValue)
            .WithMessage("Number of guests must be greater than 0.");

        When(x => x.CheckIn.HasValue && x.CheckOut.HasValue, () =>
        {
            RuleFor(x => x.CheckIn!.Value)
                .LessThan(x => x.CheckOut!.Value)
                .WithMessage("Check-in must be before check-out.");

            RuleFor(x => x.CheckIn!.Value)
                .GreaterThanOrEqualTo(_ => DateOnly.FromDateTime(timeProvider.GetUtcNow().Date))
                .WithMessage("Check-in date cannot be in the past.");
        });
    }
}

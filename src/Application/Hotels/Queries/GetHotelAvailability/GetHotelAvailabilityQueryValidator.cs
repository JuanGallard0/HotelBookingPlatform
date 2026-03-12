namespace HotelBookingPlatform.Application.Hotels.Queries.GetHotelAvailability;

public class GetHotelAvailabilityQueryValidator : AbstractValidator<GetHotelAvailabilityQuery>
{
    public GetHotelAvailabilityQueryValidator(TimeProvider timeProvider)
    {
        RuleFor(x => x.CheckIn)
            .NotEqual(default(DateOnly))
            .WithMessage("Check-in date is required.")
            .GreaterThanOrEqualTo(_ => DateOnly.FromDateTime(timeProvider.GetUtcNow().Date))
            .WithMessage("Check-in date cannot be in the past.")
            .LessThan(x => x.CheckOut)
            .WithMessage("Check-in must be before check-out.");

        RuleFor(x => x.CheckOut)
            .NotEqual(default(DateOnly))
            .WithMessage("Check-out date is required.");

        RuleFor(x => x.NumberOfGuests)
            .GreaterThan(0)
            .When(x => x.NumberOfGuests.HasValue)
            .WithMessage("Number of guests must be greater than 0.");

        RuleFor(x => x.NumberOfRooms)
            .GreaterThan(0)
            .When(x => x.NumberOfRooms.HasValue)
            .WithMessage("Number of rooms must be greater than 0.");
    }
}

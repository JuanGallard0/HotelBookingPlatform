using HotelBookingPlatform.Application.Common.Validation;

namespace HotelBookingPlatform.Application.Hotels.Queries.GetAvailableHotels;

public class GetAvailableHotelsQueryValidator : PagedSortedRequestValidator<GetAvailableHotelsQuery>
{
    public GetAvailableHotelsQueryValidator(TimeProvider timeProvider)
        : base(GetAvailableHotelsQuery.AllowedSortColumns)
    {
        RuleFor(x => x.StarRating)
            .InclusiveBetween(1, 5)
            .When(x => x.StarRating.HasValue)
            .WithMessage("Star rating must be between 1 and 5.");

        RuleFor(x => x.NumberOfGuests)
            .GreaterThan(0)
            .When(x => x.NumberOfGuests.HasValue)
            .WithMessage("Number of guests must be greater than 0.");

        RuleFor(x => x.NumberOfRooms)
            .GreaterThan(0)
            .When(x => x.NumberOfRooms.HasValue)
            .WithMessage("Number of rooms must be greater than 0.");

        RuleFor(x => x.CheckIn)
            .NotNull()
            .When(x => x.CheckOut.HasValue)
            .WithMessage("Check-in date is required when check-out is provided.");

        RuleFor(x => x.CheckOut)
            .NotNull()
            .When(x => x.CheckIn.HasValue)
            .WithMessage("Check-out date is required when check-in is provided.");

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

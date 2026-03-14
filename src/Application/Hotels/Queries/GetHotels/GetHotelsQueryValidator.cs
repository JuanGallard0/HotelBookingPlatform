using HotelBookingPlatform.Application.Common.Validation;

namespace HotelBookingPlatform.Application.Hotels.Queries.GetHotels;

public class GetHotelsQueryValidator : PagedSortedRequestValidator<GetHotelsQuery>
{
    public GetHotelsQueryValidator()
        : base(GetHotelsQuery.AllowedSortColumns)
    {
        RuleFor(x => x.StarRating)
            .InclusiveBetween(1, 5)
            .When(x => x.StarRating.HasValue)
            .WithMessage("La calificación de estrellas debe estar entre 1 y 5.");
    }
}

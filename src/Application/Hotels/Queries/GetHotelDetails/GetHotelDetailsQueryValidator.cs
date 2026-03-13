namespace HotelBookingPlatform.Application.Hotels.Queries.GetHotelDetails;

public class GetHotelDetailsQueryValidator : AbstractValidator<GetHotelDetailsQuery>
{
    public GetHotelDetailsQueryValidator()
    {
        RuleFor(x => x.HotelId)
            .GreaterThan(0).WithMessage("Hotel id must be greater than 0.");
    }
}

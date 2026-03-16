namespace HotelBookingPlatform.Application.Hotels.Queries.GetHotelDetails;

public class GetHotelDetailsQueryValidator : AbstractValidator<GetHotelDetailsQuery>
{
    public GetHotelDetailsQueryValidator()
    {
        RuleFor(x => x.HotelId)
            .GreaterThan(0).WithMessage("El id del hotel debe ser mayor que 0.");
    }
}

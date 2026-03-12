namespace HotelBookingPlatform.Application.Hotels.Queries.GetHotelById;

public class GetHotelByIdQueryValidator : AbstractValidator<GetHotelByIdQuery>
{
    public GetHotelByIdQueryValidator()
    {
        RuleFor(x => x.Id)
            .GreaterThan(0)
            .WithMessage("Hotel id must be greater than 0.");
    }
}

namespace HotelBookingPlatform.Application.Hotels.Queries.GetHotelById;

public class GetHotelByIdQueryValidator : AbstractValidator<GetHotelByIdQuery>
{
    public GetHotelByIdQueryValidator()
    {
        RuleFor(x => x.Id)
            .GreaterThan(0)
            .WithMessage("El id del hotel debe ser mayor que 0.");
    }
}

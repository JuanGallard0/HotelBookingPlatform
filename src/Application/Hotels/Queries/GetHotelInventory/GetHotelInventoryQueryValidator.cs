namespace HotelBookingPlatform.Application.Hotels.Queries.GetHotelInventory;

public class GetHotelInventoryQueryValidator : AbstractValidator<GetHotelInventoryQuery>
{
    public GetHotelInventoryQueryValidator()
    {
        RuleFor(x => x.HotelId)
            .GreaterThan(0).WithMessage("El id del hotel debe ser mayor que 0.");

        RuleFor(x => x.To)
            .GreaterThanOrEqualTo(x => x.From)
            .WithMessage("'hasta' debe ser mayor o igual a 'desde'.");
    }
}

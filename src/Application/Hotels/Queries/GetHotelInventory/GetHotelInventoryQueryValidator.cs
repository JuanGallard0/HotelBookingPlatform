namespace HotelBookingPlatform.Application.Hotels.Queries.GetHotelInventory;

public class GetHotelInventoryQueryValidator : AbstractValidator<GetHotelInventoryQuery>
{
    public GetHotelInventoryQueryValidator()
    {
        RuleFor(x => x.HotelId)
            .GreaterThan(0).WithMessage("Hotel id must be greater than 0.");

        RuleFor(x => x.To)
            .GreaterThanOrEqualTo(x => x.From)
            .WithMessage("'to' must be greater than or equal to 'from'.");
    }
}

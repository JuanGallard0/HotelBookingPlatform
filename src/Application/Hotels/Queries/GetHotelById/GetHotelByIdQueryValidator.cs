using FluentValidation;

namespace HotelBookingPlatform.Application.Hotels.Queries.GetHotelById;

public class GetHotelByIdQueryValidator : AbstractValidator<GetHotelByIdQuery>
{
    public GetHotelByIdQueryValidator()
    {
        RuleFor(x => x.Id).GreaterThan(0);
    }
}

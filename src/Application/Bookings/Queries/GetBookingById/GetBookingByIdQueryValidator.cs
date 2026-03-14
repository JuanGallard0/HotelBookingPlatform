using FluentValidation;

namespace HotelBookingPlatform.Application.Bookings.Queries.GetBookingById;

public sealed class GetBookingByIdQueryValidator : AbstractValidator<GetBookingByIdQuery>
{
    public GetBookingByIdQueryValidator()
    {
        RuleFor(x => x.BookingId)
            .GreaterThan(0).WithMessage("El id de la reserva debe ser mayor que 0.");
    }
}

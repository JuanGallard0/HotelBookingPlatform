namespace HotelBookingPlatform.Application.Bookings.Commands.ConfirmBooking;

public class ConfirmBookingCommandValidator : AbstractValidator<ConfirmBookingCommand>
{
    public ConfirmBookingCommandValidator()
    {
        RuleFor(x => x.BookingId)
            .GreaterThan(0).WithMessage("Booking id must be greater than 0.");
    }
}

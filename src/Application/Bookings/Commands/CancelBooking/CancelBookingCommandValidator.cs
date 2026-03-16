namespace HotelBookingPlatform.Application.Bookings.Commands.CancelBooking;

public class CancelBookingCommandValidator : AbstractValidator<CancelBookingCommand>
{
    public CancelBookingCommandValidator()
    {
        RuleFor(x => x.BookingId)
            .GreaterThan(0).WithMessage("El id de la reserva debe ser mayor que 0.");

        RuleFor(x => x.Reason)
            .NotEmpty().WithMessage("El motivo de cancelación es obligatorio.")
            .MaximumLength(500).WithMessage("El motivo de cancelación no debe exceder los 500 caracteres.");
    }
}

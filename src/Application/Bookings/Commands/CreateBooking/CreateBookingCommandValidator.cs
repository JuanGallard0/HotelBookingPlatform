using HotelBookingPlatform.Domain.Entities;

namespace HotelBookingPlatform.Application.Bookings.Commands.CreateBooking;

public class CreateBookingCommandValidator : AbstractValidator<CreateBookingCommand>
{
    public CreateBookingCommandValidator(TimeProvider timeProvider)
    {
        RuleFor(x => x.RoomTypeId)
            .GreaterThan(0).WithMessage("El id del tipo de habitación debe ser mayor que 0.");

        RuleFor(x => x.CheckIn)
            .GreaterThanOrEqualTo(_ => DateOnly.FromDateTime(timeProvider.GetUtcNow().Date))
            .WithMessage("La fecha de entrada no puede ser en el pasado.");

        RuleFor(x => x.CheckOut)
            .GreaterThan(x => x.CheckIn)
            .WithMessage("La fecha de salida debe ser posterior a la fecha de entrada.");

        RuleFor(x => x)
            .Must(x => (x.CheckOut.DayNumber - x.CheckIn.DayNumber) <= Booking.MaximumNightsAllowed)
            .WithMessage($"La duración máxima de la reserva es de {Booking.MaximumNightsAllowed} noches.")
            .When(x => x.CheckOut > x.CheckIn);

        RuleFor(x => x.NumberOfGuests)
            .GreaterThan(0).WithMessage("El número de huéspedes debe ser mayor que 0.");

        RuleFor(x => x.NumberOfRooms)
            .GreaterThan(0).WithMessage("El número de habitaciones debe ser mayor que 0.");

        RuleFor(x => x.Guest)
            .NotNull().WithMessage("La información del huésped es obligatoria.");

        When(x => x.Guest is not null, () =>
        {
            RuleFor(x => x.Guest.FirstName)
                .NotEmpty().WithMessage("El nombre del huésped es obligatorio.")
                .MaximumLength(100).WithMessage("El nombre del huésped no debe exceder los 100 caracteres.");

            RuleFor(x => x.Guest.LastName)
                .NotEmpty().WithMessage("El apellido del huésped es obligatorio.")
                .MaximumLength(100).WithMessage("El apellido del huésped no debe exceder los 100 caracteres.");

            RuleFor(x => x.Guest.Email)
                .NotEmpty().WithMessage("El correo electrónico del huésped es obligatorio.")
                .EmailAddress().WithMessage("El correo electrónico del huésped debe ser una dirección válida.")
                .MaximumLength(256).WithMessage("El correo electrónico del huésped no debe exceder los 256 caracteres.");

            RuleFor(x => x.Guest.PhoneNumber)
                .NotEmpty().WithMessage("El número de teléfono del huésped es obligatorio.")
                .MaximumLength(20).WithMessage("El número de teléfono del huésped no debe exceder los 20 caracteres.");
        });
    }
}

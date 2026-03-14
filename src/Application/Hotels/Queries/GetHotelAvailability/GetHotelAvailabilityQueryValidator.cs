namespace HotelBookingPlatform.Application.Hotels.Queries.GetHotelAvailability;

public class GetHotelAvailabilityQueryValidator : AbstractValidator<GetHotelAvailabilityQuery>
{
    public GetHotelAvailabilityQueryValidator(TimeProvider timeProvider)
    {
        RuleFor(x => x.CheckIn)
            .NotEqual(default(DateOnly))
            .WithMessage("La fecha de entrada es obligatoria.")
            .GreaterThanOrEqualTo(_ => DateOnly.FromDateTime(timeProvider.GetUtcNow().Date))
            .WithMessage("La fecha de entrada no puede ser en el pasado.")
            .LessThan(x => x.CheckOut)
            .WithMessage("La fecha de entrada debe ser anterior a la fecha de salida.");

        RuleFor(x => x.CheckOut)
            .NotEqual(default(DateOnly))
            .WithMessage("La fecha de salida es obligatoria.");

        RuleFor(x => x.NumberOfGuests)
            .GreaterThan(0)
            .When(x => x.NumberOfGuests.HasValue)
            .WithMessage("El número de huéspedes debe ser mayor que 0.");

        RuleFor(x => x.NumberOfRooms)
            .GreaterThan(0)
            .When(x => x.NumberOfRooms.HasValue)
            .WithMessage("El número de habitaciones debe ser mayor que 0.");
    }
}

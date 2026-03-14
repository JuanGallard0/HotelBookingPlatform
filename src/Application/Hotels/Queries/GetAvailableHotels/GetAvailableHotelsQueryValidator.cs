using HotelBookingPlatform.Application.Common.Validation;

namespace HotelBookingPlatform.Application.Hotels.Queries.GetAvailableHotels;

public class GetAvailableHotelsQueryValidator : PagedSortedRequestValidator<GetAvailableHotelsQuery>
{
    public GetAvailableHotelsQueryValidator(TimeProvider timeProvider)
        : base(GetAvailableHotelsQuery.AllowedSortColumns)
    {
        RuleFor(x => x.StarRating)
            .InclusiveBetween(1, 5)
            .When(x => x.StarRating.HasValue)
            .WithMessage("La calificación de estrellas debe estar entre 1 y 5.");

        RuleFor(x => x.NumberOfGuests)
            .GreaterThan(0)
            .When(x => x.NumberOfGuests.HasValue)
            .WithMessage("El número de huéspedes debe ser mayor que 0.");

        RuleFor(x => x.NumberOfRooms)
            .GreaterThan(0)
            .When(x => x.NumberOfRooms.HasValue)
            .WithMessage("El número de habitaciones debe ser mayor que 0.");

        RuleFor(x => x.CheckIn)
            .NotNull()
            .When(x => x.CheckOut.HasValue)
            .WithMessage("La fecha de entrada es obligatoria cuando se proporciona la fecha de salida.");

        RuleFor(x => x.CheckOut)
            .NotNull()
            .When(x => x.CheckIn.HasValue)
            .WithMessage("La fecha de salida es obligatoria cuando se proporciona la fecha de entrada.");

        When(x => x.CheckIn.HasValue && x.CheckOut.HasValue, () =>
        {
            RuleFor(x => x.CheckIn!.Value)
                .LessThan(x => x.CheckOut!.Value)
                .WithMessage("La fecha de entrada debe ser anterior a la fecha de salida.");

            RuleFor(x => x.CheckIn!.Value)
                .GreaterThanOrEqualTo(_ => DateOnly.FromDateTime(timeProvider.GetUtcNow().Date))
                .WithMessage("La fecha de entrada no puede ser en el pasado.");
        });
    }
}

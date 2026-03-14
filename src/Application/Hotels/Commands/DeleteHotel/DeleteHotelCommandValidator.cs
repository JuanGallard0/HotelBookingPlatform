namespace HotelBookingPlatform.Application.Hotels.Commands.DeleteHotel;

public class DeleteHotelCommandValidator : AbstractValidator<DeleteHotelCommand>
{
    public DeleteHotelCommandValidator()
    {
        RuleFor(x => x.Id)
            .GreaterThan(0).WithMessage("El id del hotel debe ser mayor que 0.");
    }
}

using HotelBookingPlatform.Domain.Entities;

namespace HotelBookingPlatform.Application.Bookings.Commands.CreateBooking;

public class CreateBookingCommandValidator : AbstractValidator<CreateBookingCommand>
{
    public CreateBookingCommandValidator(TimeProvider timeProvider)
    {
        RuleFor(x => x.RoomTypeId)
            .GreaterThan(0).WithMessage("Room type id must be greater than 0.");

        RuleFor(x => x.CheckIn)
            .GreaterThanOrEqualTo(_ => DateOnly.FromDateTime(timeProvider.GetUtcNow().Date))
            .WithMessage("Check-in date cannot be in the past.");

        RuleFor(x => x.CheckOut)
            .GreaterThan(x => x.CheckIn)
            .WithMessage("Check-out date must be after check-in date.");

        RuleFor(x => x)
            .Must(x => (x.CheckOut.DayNumber - x.CheckIn.DayNumber) <= Booking.MaximumNightsAllowed)
            .WithMessage($"Maximum booking duration is {Booking.MaximumNightsAllowed} nights.")
            .When(x => x.CheckOut > x.CheckIn);

        RuleFor(x => x.NumberOfGuests)
            .GreaterThan(0).WithMessage("Number of guests must be greater than 0.");

        RuleFor(x => x.NumberOfRooms)
            .GreaterThan(0).WithMessage("Number of rooms must be greater than 0.");

        RuleFor(x => x.Guest)
            .NotNull().WithMessage("Guest information is required.");

        When(x => x.Guest is not null, () =>
        {
            RuleFor(x => x.Guest.FirstName)
                .NotEmpty().WithMessage("Guest first name is required.")
                .MaximumLength(100).WithMessage("Guest first name must not exceed 100 characters.");

            RuleFor(x => x.Guest.LastName)
                .NotEmpty().WithMessage("Guest last name is required.")
                .MaximumLength(100).WithMessage("Guest last name must not exceed 100 characters.");

            RuleFor(x => x.Guest.Email)
                .NotEmpty().WithMessage("Guest email is required.")
                .EmailAddress().WithMessage("Guest email must be a valid email address.")
                .MaximumLength(256).WithMessage("Guest email must not exceed 256 characters.");

            RuleFor(x => x.Guest.PhoneNumber)
                .NotEmpty().WithMessage("Guest phone number is required.")
                .MaximumLength(20).WithMessage("Guest phone number must not exceed 20 characters.");
        });
    }
}

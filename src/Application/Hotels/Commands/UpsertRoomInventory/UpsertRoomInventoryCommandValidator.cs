namespace HotelBookingPlatform.Application.Hotels.Commands.UpsertRoomInventory;

public class UpsertRoomInventoryCommandValidator : AbstractValidator<UpsertRoomInventoryCommand>
{
    public UpsertRoomInventoryCommandValidator()
    {
        RuleFor(x => x.RoomTypeId)
            .GreaterThan(0).WithMessage("Room type id must be greater than 0.");

        RuleFor(x => x.TotalRooms)
            .GreaterThanOrEqualTo(0).WithMessage("Total rooms must be greater than or equal to 0.");

        RuleFor(x => x.AvailableRooms)
            .GreaterThanOrEqualTo(0).WithMessage("Available rooms must be greater than or equal to 0.")
            .LessThanOrEqualTo(x => x.TotalRooms).WithMessage("Available rooms cannot exceed total rooms.");
    }
}

namespace HotelBookingPlatform.Application.Hotels.Commands.BulkUpdateRoomInventory;

public class BulkUpdateRoomInventoryCommandValidator : AbstractValidator<BulkUpdateRoomInventoryCommand>
{
    public BulkUpdateRoomInventoryCommandValidator()
    {
        RuleFor(x => x.RoomTypeId)
            .GreaterThan(0).WithMessage("Room type id must be greater than 0.");

        RuleFor(x => x.To)
            .GreaterThanOrEqualTo(x => x.From)
            .WithMessage("To must be greater than or equal to from.");

        RuleFor(x => x.TotalRooms)
            .GreaterThanOrEqualTo(0).WithMessage("Total rooms must be greater than or equal to 0.");

        RuleFor(x => x.AvailableRooms)
            .GreaterThanOrEqualTo(0).WithMessage("Available rooms must be greater than or equal to 0.")
            .LessThanOrEqualTo(x => x.TotalRooms).WithMessage("Available rooms cannot exceed total rooms.");
    }
}

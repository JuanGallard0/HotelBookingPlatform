namespace HotelBookingPlatform.Application.Hotels.Commands.DeleteRoomType;

public class DeleteRoomTypeCommandValidator : AbstractValidator<DeleteRoomTypeCommand>
{
    public DeleteRoomTypeCommandValidator()
    {
        RuleFor(x => x.RoomTypeId)
            .GreaterThan(0).WithMessage("Room type id must be greater than 0.");
    }
}

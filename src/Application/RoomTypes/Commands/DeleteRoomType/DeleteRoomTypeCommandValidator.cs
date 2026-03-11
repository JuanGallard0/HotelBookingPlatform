namespace HotelBookingPlatform.Application.RoomTypes.Commands.DeleteRoomType;

public class DeleteRoomTypeCommandValidator : AbstractValidator<DeleteRoomTypeCommand>
{
    public DeleteRoomTypeCommandValidator()
    {
        RuleFor(x => x.HotelId).GreaterThan(0);
        RuleFor(x => x.Id).GreaterThan(0);
    }
}

namespace HotelBookingPlatform.Application.RoomTypes.Queries.GetRoomTypeById;

public class GetRoomTypeByIdQueryValidator : AbstractValidator<GetRoomTypeByIdQuery>
{
    public GetRoomTypeByIdQueryValidator()
    {
        RuleFor(x => x.HotelId).GreaterThan(0);
        RuleFor(x => x.Id).GreaterThan(0);
    }
}

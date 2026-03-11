using HotelBookingPlatform.Application.Common.Validation;

namespace HotelBookingPlatform.Application.RoomTypes.Queries.GetRoomTypes;

public class GetRoomTypesQueryValidator : PagedSortedRequestValidator<GetRoomTypesQuery>
{
    public GetRoomTypesQueryValidator() : base(GetRoomTypesQuery.AllowedSortColumns)
    {
        RuleFor(x => x.HotelId).GreaterThan(0);
    }
}

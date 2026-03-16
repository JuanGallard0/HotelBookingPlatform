using HotelBookingPlatform.Application.Common.Validation;

namespace HotelBookingPlatform.Application.Hotels.Queries.GetHotels;

public class GetHotelsQueryValidator : PagedSortedRequestValidator<GetHotelsQuery>
{
    public GetHotelsQueryValidator()
        : base(GetHotelsQuery.AllowedSortColumns)
    {
    }
}

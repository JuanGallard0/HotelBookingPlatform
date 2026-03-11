using HotelBookingPlatform.Application.Common.Models;

namespace HotelBookingPlatform.Application.RoomTypes.Queries.GetRoomTypes;

public record GetRoomTypesQuery : PagedSortedRequest, IRequest<Result<PagedResponse<RoomTypeDto>>>
{
    public int HotelId { get; init; }
    public bool? IsActive { get; init; }

    public static readonly IReadOnlySet<string> AllowedSortColumns =
        new HashSet<string>(StringComparer.OrdinalIgnoreCase)
        {
            "Id", "Name", "MaxOccupancy", "BasePrice"
        };
}

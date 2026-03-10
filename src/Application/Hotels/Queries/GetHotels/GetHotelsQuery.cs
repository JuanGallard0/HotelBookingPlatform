using HotelBookingPlatform.Application.Common.Models;

namespace HotelBookingPlatform.Application.Hotels.Queries.GetHotels;

public record GetHotelsQuery : PagedSortedRequest, IRequest<Result<PagedResponse<HotelDto>>>
{
    public string? Name { get; init; }
    public string? City { get; init; }
    public string? Country { get; init; }
    public int? StarRating { get; init; }
    public bool? IsActive { get; init; }

    public DateOnly? CheckIn { get; init; }
    public DateOnly? CheckOut { get; init; }
    public int? NumberOfGuests { get; init; }

    public static readonly IReadOnlySet<string> AllowedSortColumns =
        new HashSet<string>(StringComparer.OrdinalIgnoreCase)
        {
            "Id", "Name", "City", "Country", "StarRating"
        };
}

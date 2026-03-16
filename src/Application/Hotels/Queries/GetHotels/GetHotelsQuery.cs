using HotelBookingPlatform.Application.Common.Models;
using HotelBookingPlatform.Application.Hotels.Queries.GetHotelById;

namespace HotelBookingPlatform.Application.Hotels.Queries.GetHotels;

public record GetHotelsQuery : PagedSortedRequest, IRequest<Result<PagedResponse<HotelDto>>>
{
    public string? Search { get; init; }
    public bool? IsActive { get; init; }

    public static readonly IReadOnlySet<string> AllowedSortColumns =
        new HashSet<string>(StringComparer.OrdinalIgnoreCase)
        {
            "HotelId", "Name", "City", "Country", "StarRating", "IsActive"
        };
}

public class GetHotelsQueryHandler(IHotelQueryService hotelQueryService)
    : IRequestHandler<GetHotelsQuery, Result<PagedResponse<HotelDto>>>
{
    public async Task<Result<PagedResponse<HotelDto>>> Handle(
        GetHotelsQuery request,
        CancellationToken cancellationToken)
    {
        var (hotels, totalCount) = await hotelQueryService.GetHotelsAsync(request, cancellationToken);

        return Result<PagedResponse<HotelDto>>.Success(
            new PagedResponse<HotelDto>(hotels, request.ResolvedPageNumber, request.ResolvedPageSize, totalCount));
    }
}

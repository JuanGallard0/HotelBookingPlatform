using HotelBookingPlatform.Application.Common.Models;

namespace HotelBookingPlatform.Application.Hotels.Queries.GetAvailableHotels;

public record GetAvailableHotelsQuery : PagedSortedRequest, IRequest<Result<PagedResponse<AvailableHotelDto>>>
{
    public string? Name { get; init; }
    public string? City { get; init; }
    public string? Country { get; init; }
    public int? StarRating { get; init; }

    public DateOnly? CheckIn { get; init; }
    public DateOnly? CheckOut { get; init; }
    public int? NumberOfGuests { get; init; }
    public int? NumberOfRooms { get; init; }

    public static readonly IReadOnlySet<string> AllowedSortColumns =
        new HashSet<string>(StringComparer.OrdinalIgnoreCase)
        {
            "HotelId", "Name", "City", "Country", "StarRating", "PricePerNightFrom"
        };
}

public class GetAvailableHotelsQueryHandler(IHotelQueryService hotelQueryService)
    : IRequestHandler<GetAvailableHotelsQuery, Result<PagedResponse<AvailableHotelDto>>>
{
    public async Task<Result<PagedResponse<AvailableHotelDto>>> Handle(
        GetAvailableHotelsQuery request,
        CancellationToken cancellationToken)
    {
        var (hotels, totalCount) = await hotelQueryService.GetAvailableHotelsAsync(request, cancellationToken);

        var response = new PagedResponse<AvailableHotelDto>(
            hotels,
            request.ResolvedPageNumber,
            request.ResolvedPageSize,
            totalCount);

        return Result<PagedResponse<AvailableHotelDto>>.Success(response);
    }
}

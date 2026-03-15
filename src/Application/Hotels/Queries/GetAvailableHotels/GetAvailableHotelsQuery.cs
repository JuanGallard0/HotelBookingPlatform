using HotelBookingPlatform.Application.Common.Interfaces;
using HotelBookingPlatform.Application.Common.Models;

namespace HotelBookingPlatform.Application.Hotels.Queries.GetAvailableHotels;

public record GetAvailableHotelsQuery : PagedSortedRequest, IRequest<Result<PagedResponse<AvailableHotelDto>>>
{
    public string? Search { get; init; }
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

public class GetAvailableHotelsQueryHandler(
    IHotelQueryService hotelQueryService,
    IAvailabilityCache availabilityCache)
    : IRequestHandler<GetAvailableHotelsQuery, Result<PagedResponse<AvailableHotelDto>>>
{
    public async Task<Result<PagedResponse<AvailableHotelDto>>> Handle(
        GetAvailableHotelsQuery request,
        CancellationToken cancellationToken)
    {
        var cacheKey =
            $"available-hotels:{request.Search?.Trim().ToLowerInvariant() ?? "-"}:" +
            $"{request.StarRating?.ToString() ?? "-"}:" +
            $"{request.CheckIn?.ToString("O") ?? "-"}:{request.CheckOut?.ToString("O") ?? "-"}:" +
            $"{request.NumberOfGuests?.ToString() ?? "-"}:{request.NumberOfRooms?.ToString() ?? "-"}:" +
            $"{request.ResolvedPageNumber}:{request.ResolvedPageSize}:" +
            $"{request.SortBy?.Trim().ToLowerInvariant() ?? "-"}:{request.ResolvedSortDirection.ToLowerInvariant()}";

        var (hotels, totalCount) = await availabilityCache.GetOrCreateAsync(
            cacheKey,
            ct => hotelQueryService.GetAvailableHotelsAsync(request, ct),
            cancellationToken);

        var response = new PagedResponse<AvailableHotelDto>(
            hotels,
            request.ResolvedPageNumber,
            request.ResolvedPageSize,
            totalCount);

        return Result<PagedResponse<AvailableHotelDto>>.Success(response);
    }
}

namespace HotelBookingPlatform.Application.Common.Models;

public abstract record PagedSortedRequest
{
    public int? PageNumber { get; init; }
    public int? PageSize { get; init; }
    public string? SortBy { get; init; }
    public string? SortDirection { get; init; }

    public int ResolvedPageNumber => PageNumber ?? 1;
    public int ResolvedPageSize => PageSize ?? 10;
    public string ResolvedSortDirection => SortDirection ?? "asc";
}

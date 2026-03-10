namespace HotelBookingPlatform.Application.Hotels.Queries.GetHotels;

public readonly record struct HotelQueryResult(IReadOnlyList<HotelDto> Hotels, int TotalCount);

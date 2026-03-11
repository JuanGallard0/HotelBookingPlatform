namespace HotelBookingPlatform.Application.Hotels.Queries.GetHotels;

public record HotelQueryResult(IReadOnlyList<HotelDto> Hotels, int TotalCount);

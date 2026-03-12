using HotelBookingPlatform.Application.Common.Models;

namespace HotelBookingPlatform.Application.Hotels.Queries.GetHotelById;

public record GetHotelByIdQuery(int Id) : IRequest<Result<HotelDto>>;

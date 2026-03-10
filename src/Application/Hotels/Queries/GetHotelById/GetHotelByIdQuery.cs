using HotelBookingPlatform.Application.Common.Models;
using MediatR;

namespace HotelBookingPlatform.Application.Hotels.Queries.GetHotelById;

public record GetHotelByIdQuery(int Id) : IRequest<Result<HotelDetailDto>>;

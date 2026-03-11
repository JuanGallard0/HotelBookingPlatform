using HotelBookingPlatform.Application.Common.Models;

namespace HotelBookingPlatform.Application.Hotels.Commands.DeleteHotel;

public record DeleteHotelCommand(int Id) : IRequest<Result>;

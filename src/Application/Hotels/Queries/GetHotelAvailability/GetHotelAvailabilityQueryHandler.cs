using HotelBookingPlatform.Application.Common.Interfaces;
using HotelBookingPlatform.Application.Common.Models;

namespace HotelBookingPlatform.Application.Hotels.Queries.GetHotelAvailability;

public class GetHotelAvailabilityQueryHandler(
    IApplicationDbContext context,
    IHotelQueryService hotelQueryService)
    : IRequestHandler<GetHotelAvailabilityQuery, Result<HotelAvailabilityDto>>
{
    public async Task<Result<HotelAvailabilityDto>> Handle(
        GetHotelAvailabilityQuery request,
        CancellationToken cancellationToken)
    {
        var hotelExists = await context.Hotels
            .AnyAsync(h => h.Id == request.HotelId, cancellationToken);

        if (!hotelExists)
            return Result<HotelAvailabilityDto>.NotFound($"Hotel with id {request.HotelId} was not found.");

        var checkIn = request.CheckIn!.Value;
        var checkOut = request.CheckOut!.Value;
        var nights = checkOut.DayNumber - checkIn.DayNumber;

        var roomTypes = await hotelQueryService.GetHotelAvailabilityAsync(request, cancellationToken);

        var response = new HotelAvailabilityDto
        {
            HotelId = request.HotelId,
            CheckIn = checkIn,
            CheckOut = checkOut,
            Nights = nights,
            AvailableRoomTypes = roomTypes,
        };

        return Result<HotelAvailabilityDto>.Success(response);
    }
}

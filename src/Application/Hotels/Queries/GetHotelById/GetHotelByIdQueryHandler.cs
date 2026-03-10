using HotelBookingPlatform.Application.Common.Models;
using HotelBookingPlatform.Application.Hotels.Queries;
using MediatR;

namespace HotelBookingPlatform.Application.Hotels.Queries.GetHotelById;

public class GetHotelByIdQueryHandler(IHotelQueryService hotelQueryService)
    : IRequestHandler<GetHotelByIdQuery, Result<HotelDetailDto>>
{
    public async Task<Result<HotelDetailDto>> Handle(
        GetHotelByIdQuery request,
        CancellationToken cancellationToken)
    {
        var hotel = await hotelQueryService.GetHotelByIdAsync(request.Id, cancellationToken);

        if (hotel is null)
            return Result<HotelDetailDto>.NotFound($"Hotel with id {request.Id} was not found.");

        return Result<HotelDetailDto>.Success(hotel);
    }
}

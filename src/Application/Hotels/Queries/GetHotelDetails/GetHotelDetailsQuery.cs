using HotelBookingPlatform.Application.Common.Models;

namespace HotelBookingPlatform.Application.Hotels.Queries.GetHotelDetails;

public record GetHotelDetailsQuery(int HotelId) : IRequest<Result<HotelDetailsDto>>;

public class GetHotelDetailsQueryHandler(IHotelQueryService hotelQueryService)
    : IRequestHandler<GetHotelDetailsQuery, Result<HotelDetailsDto>>
{
    public async Task<Result<HotelDetailsDto>> Handle(GetHotelDetailsQuery request, CancellationToken cancellationToken)
    {
        var details = await hotelQueryService.GetHotelDetailsAsync(request.HotelId, cancellationToken);

        if (details is null)
            return Result<HotelDetailsDto>.NotFound($"Hotel with id {request.HotelId} was not found.");

        return Result<HotelDetailsDto>.Success(details);
    }
}

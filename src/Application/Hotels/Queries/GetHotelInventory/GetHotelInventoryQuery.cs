using HotelBookingPlatform.Application.Common.Models;

namespace HotelBookingPlatform.Application.Hotels.Queries.GetHotelInventory;

public record GetHotelInventoryQuery : IRequest<Result<HotelInventoryDto>>
{
    public int HotelId { get; init; }
    public DateOnly From { get; init; }
    public DateOnly To { get; init; }
}

public class GetHotelInventoryQueryHandler(IHotelQueryService hotelQueryService)
    : IRequestHandler<GetHotelInventoryQuery, Result<HotelInventoryDto>>
{
    public async Task<Result<HotelInventoryDto>> Handle(GetHotelInventoryQuery request, CancellationToken cancellationToken)
    {
        var inventory = await hotelQueryService.GetHotelInventoryAsync(request, cancellationToken);

        if (inventory is null)
            return Result<HotelInventoryDto>.NotFound($"Hotel with id {request.HotelId} was not found.");

        return Result<HotelInventoryDto>.Success(inventory);
    }
}

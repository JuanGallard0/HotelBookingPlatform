using HotelBookingPlatform.Application.Common.Models;
using HotelBookingPlatform.Application.Hotels.Queries.GetHotelById;
using HotelBookingPlatform.Application.Hotels.Queries.GetHotels;

namespace HotelBookingPlatform.Api.Endpoints;

public class HotelsEndpoints : EndpointGroupBase
{
    public override string GroupName => "hotels";

    public override void Map(RouteGroupBuilder group)
    {
        group.MapGet(GetHotels)
            .WithSummary("List / search hotels")
            .Produces<ApiResponse<PagedResponse<HotelDto>>>(StatusCodes.Status200OK)
            .Produces<ApiResponse<object?>>(StatusCodes.Status400BadRequest)
            .Produces<ApiResponse<object?>>(StatusCodes.Status422UnprocessableEntity);

        group.MapGet("{id:int}", GetHotelById)
            .WithSummary("Get hotel by ID")
            .Produces<ApiResponse<HotelDetailDto>>(StatusCodes.Status200OK)
            .Produces<ApiResponse<object?>>(StatusCodes.Status400BadRequest)
            .Produces<ApiResponse<object?>>(StatusCodes.Status404NotFound);
    }

    private static async Task<IResult> GetHotels(
        [AsParameters] GetHotelsQuery query,
        ISender sender,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(query, cancellationToken);
        return result.ToHttpResult();
    }

    private static async Task<IResult> GetHotelById(
        int id,
        ISender sender,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(new GetHotelByIdQuery(id), cancellationToken);
        return result.ToHttpResult();
    }
}

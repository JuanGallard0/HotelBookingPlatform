using HotelBookingPlatform.Application.Common.Models;
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
    }

    private static async Task<IResult> GetHotels(
        [AsParameters] GetHotelsQuery query,
        ISender sender,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(query, cancellationToken);
        return result.ToHttpResult();
    }
}

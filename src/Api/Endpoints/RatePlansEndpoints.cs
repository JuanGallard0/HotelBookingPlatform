using HotelBookingPlatform.Application.Hotels.Commands.DeleteRatePlan;
using HotelBookingPlatform.Application.Hotels.Commands.UpdateRatePlan;
using Microsoft.AspNetCore.Mvc;

namespace HotelBookingPlatform.Api.Endpoints;

public class RatePlansEndpoints : EndpointGroupBase
{
    public override string GroupName => "rate-plans";

    public override void Map(RouteGroupBuilder group)
    {
        group.MapPut("{ratePlanId:int}", UpdateRatePlan)
            .WithSummary("Update a rate plan")
            .Produces<ApiResponse<object?>>(StatusCodes.Status200OK)
            .Produces<ApiResponse<object?>>(StatusCodes.Status400BadRequest)
            .Produces<ApiResponse<object?>>(StatusCodes.Status401Unauthorized)
            .Produces<ApiResponse<object?>>(StatusCodes.Status403Forbidden)
            .Produces<ApiResponse<object?>>(StatusCodes.Status404NotFound)
            .RequireAuthorization("AdminOnly");

        group.MapDelete("{ratePlanId:int}", DeleteRatePlan)
            .WithSummary("Delete a rate plan")
            .Produces<ApiResponse<object?>>(StatusCodes.Status200OK)
            .Produces<ApiResponse<object?>>(StatusCodes.Status401Unauthorized)
            .Produces<ApiResponse<object?>>(StatusCodes.Status403Forbidden)
            .Produces<ApiResponse<object?>>(StatusCodes.Status404NotFound)
            .RequireAuthorization("AdminOnly");
    }

    private static async Task<IResult> UpdateRatePlan(
        int ratePlanId,
        [FromBody] UpdateRatePlanCommand body,
        ISender sender,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(body with { RatePlanId = ratePlanId }, cancellationToken);
        return result.ToHttpResult();
    }

    private static async Task<IResult> DeleteRatePlan(
        int ratePlanId,
        ISender sender,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(new DeleteRatePlanCommand(ratePlanId), cancellationToken);
        return result.ToHttpResult();
    }
}

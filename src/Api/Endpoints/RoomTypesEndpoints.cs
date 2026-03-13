using HotelBookingPlatform.Application.Hotels.Commands.BulkUpdateRoomInventory;
using HotelBookingPlatform.Application.Hotels.Commands.CreateRatePlan;
using HotelBookingPlatform.Application.Hotels.Commands.DeleteRoomType;
using HotelBookingPlatform.Application.Hotels.Commands.UpdateRoomType;
using HotelBookingPlatform.Application.Hotels.Commands.UpsertRoomInventory;
using Microsoft.AspNetCore.Mvc;

namespace HotelBookingPlatform.Api.Endpoints;

public class RoomTypesEndpoints : EndpointGroupBase
{
    public override string GroupName => "room-types";

    public override void Map(RouteGroupBuilder group)
    {
        group.MapPost("{roomTypeId:int}/rate-plans", CreateRatePlan)
            .WithSummary("Create a rate plan for a room type")
            .Produces<ApiResponse<int>>(StatusCodes.Status201Created)
            .Produces<ApiResponse<object?>>(StatusCodes.Status400BadRequest)
            .Produces<ApiResponse<object?>>(StatusCodes.Status401Unauthorized)
            .Produces<ApiResponse<object?>>(StatusCodes.Status403Forbidden)
            .Produces<ApiResponse<object?>>(StatusCodes.Status404NotFound)
            .RequireAuthorization("AdminOnly");

        group.MapPut("{roomTypeId:int}", UpdateRoomType)
            .WithSummary("Update a room type")
            .Produces<ApiResponse<object?>>(StatusCodes.Status200OK)
            .Produces<ApiResponse<object?>>(StatusCodes.Status400BadRequest)
            .Produces<ApiResponse<object?>>(StatusCodes.Status401Unauthorized)
            .Produces<ApiResponse<object?>>(StatusCodes.Status403Forbidden)
            .Produces<ApiResponse<object?>>(StatusCodes.Status404NotFound)
            .RequireAuthorization("AdminOnly");

        group.MapDelete("{roomTypeId:int}", DeleteRoomType)
            .WithSummary("Delete a room type")
            .Produces<ApiResponse<object?>>(StatusCodes.Status200OK)
            .Produces<ApiResponse<object?>>(StatusCodes.Status401Unauthorized)
            .Produces<ApiResponse<object?>>(StatusCodes.Status403Forbidden)
            .Produces<ApiResponse<object?>>(StatusCodes.Status404NotFound)
            .Produces<ApiResponse<object?>>(StatusCodes.Status409Conflict)
            .RequireAuthorization("AdminOnly");

        group.MapPut("{roomTypeId:int}/inventory/{date}", UpsertInventory)
            .WithSummary("Upsert inventory for a room type on a specific date")
            .Produces<ApiResponse<object?>>(StatusCodes.Status200OK)
            .Produces<ApiResponse<object?>>(StatusCodes.Status400BadRequest)
            .Produces<ApiResponse<object?>>(StatusCodes.Status401Unauthorized)
            .Produces<ApiResponse<object?>>(StatusCodes.Status403Forbidden)
            .Produces<ApiResponse<object?>>(StatusCodes.Status404NotFound)
            .Produces<ApiResponse<object?>>(StatusCodes.Status409Conflict)
            .RequireAuthorization("AdminOnly");

        group.MapPost("{roomTypeId:int}/inventory/bulk", BulkUpdateInventory)
            .WithSummary("Bulk update inventory for a room type")
            .Produces<ApiResponse<object?>>(StatusCodes.Status200OK)
            .Produces<ApiResponse<object?>>(StatusCodes.Status400BadRequest)
            .Produces<ApiResponse<object?>>(StatusCodes.Status401Unauthorized)
            .Produces<ApiResponse<object?>>(StatusCodes.Status403Forbidden)
            .Produces<ApiResponse<object?>>(StatusCodes.Status404NotFound)
            .RequireAuthorization("AdminOnly");
    }

    private static async Task<IResult> CreateRatePlan(
        int roomTypeId,
        [FromBody] CreateRatePlanCommand body,
        ISender sender,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(body with { RoomTypeId = roomTypeId }, cancellationToken);
        return result.ToCreatedHttpResult($"/api/v1/rate-plans/{result.Value}");
    }

    private static async Task<IResult> UpdateRoomType(
        int roomTypeId,
        [FromBody] UpdateRoomTypeCommand body,
        ISender sender,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(body with { RoomTypeId = roomTypeId }, cancellationToken);
        return result.ToHttpResult();
    }

    private static async Task<IResult> DeleteRoomType(
        int roomTypeId,
        ISender sender,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(new DeleteRoomTypeCommand(roomTypeId), cancellationToken);
        return result.ToHttpResult();
    }

    private static async Task<IResult> UpsertInventory(
        int roomTypeId,
        DateOnly date,
        [FromBody] UpsertRoomInventoryCommand body,
        ISender sender,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(body with { RoomTypeId = roomTypeId, Date = date }, cancellationToken);
        return result.ToHttpResult();
    }

    private static async Task<IResult> BulkUpdateInventory(
        int roomTypeId,
        [FromBody] BulkUpdateRoomInventoryCommand body,
        ISender sender,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(body with { RoomTypeId = roomTypeId }, cancellationToken);
        return result.ToHttpResult();
    }
}

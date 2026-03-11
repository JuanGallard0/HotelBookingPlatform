using HotelBookingPlatform.Application.Common.Models;
using HotelBookingPlatform.Application.Hotels.Commands.CreateHotel;
using HotelBookingPlatform.Application.Hotels.Commands.DeleteHotel;
using HotelBookingPlatform.Application.Hotels.Commands.UpdateHotel;
using HotelBookingPlatform.Application.Hotels.Queries.GetHotelById;
using HotelBookingPlatform.Application.Hotels.Queries.GetHotels;
using HotelBookingPlatform.Application.RoomTypes.Commands.CreateRoomType;
using HotelBookingPlatform.Application.RoomTypes.Commands.DeleteRoomType;
using HotelBookingPlatform.Application.RoomTypes.Commands.UpdateRoomType;
using HotelBookingPlatform.Application.RoomTypes.Queries;
using HotelBookingPlatform.Application.RoomTypes.Queries.GetRoomTypeById;
using HotelBookingPlatform.Application.RoomTypes.Queries.GetRoomTypes;
using Microsoft.AspNetCore.Mvc;

namespace HotelBookingPlatform.Api.Endpoints;

public class HotelsEndpoints : EndpointGroupBase
{
    public override string GroupName => "hotels";

    public override void Map(RouteGroupBuilder group)
    {
        // Hotels
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

        group.MapPost(CreateHotel)
            .WithSummary("Create a hotel")
            .Produces<ApiResponse<int>>(StatusCodes.Status201Created)
            .Produces<ApiResponse<object?>>(StatusCodes.Status400BadRequest);

        group.MapPut("{id:int}", UpdateHotel)
            .WithSummary("Update a hotel")
            .Produces<ApiResponse<object?>>(StatusCodes.Status200OK)
            .Produces<ApiResponse<object?>>(StatusCodes.Status400BadRequest)
            .Produces<ApiResponse<object?>>(StatusCodes.Status404NotFound);

        group.MapDelete("{id:int}", DeleteHotel)
            .WithSummary("Delete a hotel")
            .Produces<ApiResponse<object?>>(StatusCodes.Status200OK)
            .Produces<ApiResponse<object?>>(StatusCodes.Status404NotFound)
            .Produces<ApiResponse<object?>>(StatusCodes.Status409Conflict);

        // Room Types (nested under /hotels/{hotelId}/room-types)
        group.MapGet("{hotelId:int}/room-types", GetRoomTypes)
            .WithSummary("List room types for a hotel")
            .Produces<ApiResponse<PagedResponse<RoomTypeDto>>>(StatusCodes.Status200OK)
            .Produces<ApiResponse<object?>>(StatusCodes.Status400BadRequest);

        group.MapGet("{hotelId:int}/room-types/{id:int}", GetRoomTypeById)
            .WithSummary("Get room type by ID")
            .Produces<ApiResponse<RoomTypeDto>>(StatusCodes.Status200OK)
            .Produces<ApiResponse<object?>>(StatusCodes.Status404NotFound);

        group.MapPost("{hotelId:int}/room-types", CreateRoomType)
            .WithSummary("Create a room type")
            .Produces<ApiResponse<int>>(StatusCodes.Status201Created)
            .Produces<ApiResponse<object?>>(StatusCodes.Status400BadRequest)
            .Produces<ApiResponse<object?>>(StatusCodes.Status404NotFound);

        group.MapPut("{hotelId:int}/room-types/{id:int}", UpdateRoomType)
            .WithSummary("Update a room type")
            .Produces<ApiResponse<object?>>(StatusCodes.Status200OK)
            .Produces<ApiResponse<object?>>(StatusCodes.Status400BadRequest)
            .Produces<ApiResponse<object?>>(StatusCodes.Status404NotFound);

        group.MapDelete("{hotelId:int}/room-types/{id:int}", DeleteRoomType)
            .WithSummary("Delete a room type")
            .Produces<ApiResponse<object?>>(StatusCodes.Status200OK)
            .Produces<ApiResponse<object?>>(StatusCodes.Status404NotFound)
            .Produces<ApiResponse<object?>>(StatusCodes.Status409Conflict);
    }

    // ── Hotels ────────────────────────────────────────────────────────────────

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

    private static async Task<IResult> CreateHotel(
        [FromBody] CreateHotelCommand command,
        ISender sender,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(command, cancellationToken);
        return result.ToCreatedHttpResult($"/api/v1/hotels/{result.Value}");
    }

    private static async Task<IResult> UpdateHotel(
        int id,
        [FromBody] UpdateHotelCommand body,
        ISender sender,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(body with { Id = id }, cancellationToken);
        return result.ToHttpResult();
    }

    private static async Task<IResult> DeleteHotel(
        int id,
        ISender sender,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(new DeleteHotelCommand(id), cancellationToken);
        return result.ToHttpResult();
    }

    // ── Room Types ────────────────────────────────────────────────────────────

    private static async Task<IResult> GetRoomTypes(
        [AsParameters] GetRoomTypesQuery query,
        ISender sender,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(query, cancellationToken);
        return result.ToHttpResult();
    }

    private static async Task<IResult> GetRoomTypeById(
        int hotelId,
        int id,
        ISender sender,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(new GetRoomTypeByIdQuery(hotelId, id), cancellationToken);
        return result.ToHttpResult();
    }

    private static async Task<IResult> CreateRoomType(
        int hotelId,
        [FromBody] CreateRoomTypeCommand body,
        ISender sender,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(body with { HotelId = hotelId }, cancellationToken);
        return result.ToCreatedHttpResult($"/api/v1/hotels/{hotelId}/room-types/{result.Value}");
    }

    private static async Task<IResult> UpdateRoomType(
        int hotelId,
        int id,
        [FromBody] UpdateRoomTypeCommand body,
        ISender sender,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(body with { HotelId = hotelId, Id = id }, cancellationToken);
        return result.ToHttpResult();
    }

    private static async Task<IResult> DeleteRoomType(
        int hotelId,
        int id,
        ISender sender,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(new DeleteRoomTypeCommand(hotelId, id), cancellationToken);
        return result.ToHttpResult();
    }
}

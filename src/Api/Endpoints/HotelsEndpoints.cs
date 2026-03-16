using HotelBookingPlatform.Application.Common.Models;
using HotelBookingPlatform.Application.Hotels.Commands.CreateHotel;
using HotelBookingPlatform.Application.Hotels.Commands.CreateRoomType;
using HotelBookingPlatform.Application.Hotels.Commands.DeleteHotel;
using HotelBookingPlatform.Application.Hotels.Commands.UpdateHotel;
using HotelBookingPlatform.Application.Hotels.Queries.GetAvailableHotels;
using HotelBookingPlatform.Application.Hotels.Queries.GetHotelAvailability;
using HotelBookingPlatform.Application.Hotels.Queries.GetHotelById;
using HotelBookingPlatform.Application.Hotels.Queries.GetHotelDetails;
using HotelBookingPlatform.Application.Hotels.Queries.GetHotelInventory;
using HotelBookingPlatform.Application.Hotels.Queries.GetHotels;
using Microsoft.AspNetCore.Mvc;

namespace HotelBookingPlatform.Api.Endpoints;

public class HotelsEndpoints : EndpointGroupBase
{
    public override string GroupName => "hotels";

    public override void Map(RouteGroupBuilder group)
    {
        group.MapGet(GetAvailableHotels)
            .WithSummary("Search available hotels")
            .Produces<ApiResponse<PagedResponse<AvailableHotelDto>>>(StatusCodes.Status200OK)
            .Produces<ApiResponse<object?>>(StatusCodes.Status400BadRequest)
            .Produces<ApiResponse<object?>>(StatusCodes.Status422UnprocessableEntity);

        group.MapGet("list", GetHotels)
            .WithSummary("Browse all hotels")
            .Produces<ApiResponse<PagedResponse<HotelDto>>>(StatusCodes.Status200OK)
            .Produces<ApiResponse<object?>>(StatusCodes.Status400BadRequest)
            .Produces<ApiResponse<object?>>(StatusCodes.Status401Unauthorized)
            .Produces<ApiResponse<object?>>(StatusCodes.Status403Forbidden)
            .RequireAuthorization("AdminOnly");

        group.MapGet("{id:int}", GetHotelById)
            .WithSummary("Get hotel by id")
            .Produces<ApiResponse<HotelDto>>(StatusCodes.Status200OK)
            .Produces<ApiResponse<object?>>(StatusCodes.Status404NotFound);

        group.MapGet("{hotelId:int}/details", GetHotelDetails)
            .WithSummary("Get hotel details for management")
            .Produces<ApiResponse<HotelDetailsDto>>(StatusCodes.Status200OK)
            .Produces<ApiResponse<object?>>(StatusCodes.Status400BadRequest)
            .Produces<ApiResponse<object?>>(StatusCodes.Status401Unauthorized)
            .Produces<ApiResponse<object?>>(StatusCodes.Status403Forbidden)
            .Produces<ApiResponse<object?>>(StatusCodes.Status404NotFound)
            .RequireAuthorization("AdminOnly");

        group.MapGet("{id:int}/availability", GetHotelAvailability)
            .WithSummary("Get available room types for a hotel")
            .Produces<ApiResponse<HotelAvailabilityDto>>(StatusCodes.Status200OK)
            .Produces<ApiResponse<object?>>(StatusCodes.Status400BadRequest)
            .Produces<ApiResponse<object?>>(StatusCodes.Status404NotFound)
            .Produces<ApiResponse<object?>>(StatusCodes.Status422UnprocessableEntity);

        group.MapGet("{hotelId:int}/inventory", GetHotelInventory)
            .WithSummary("Get hotel inventory for a calendar range")
            .Produces<ApiResponse<HotelInventoryDto>>(StatusCodes.Status200OK)
            .Produces<ApiResponse<object?>>(StatusCodes.Status400BadRequest)
            .Produces<ApiResponse<object?>>(StatusCodes.Status401Unauthorized)
            .Produces<ApiResponse<object?>>(StatusCodes.Status403Forbidden)
            .Produces<ApiResponse<object?>>(StatusCodes.Status404NotFound)
            .RequireAuthorization("AdminOnly");

        group.MapPost(CreateHotel)
            .WithSummary("Create a hotel")
            .Produces<ApiResponse<int>>(StatusCodes.Status201Created)
            .Produces<ApiResponse<object?>>(StatusCodes.Status400BadRequest)
            .Produces<ApiResponse<object?>>(StatusCodes.Status401Unauthorized)
            .Produces<ApiResponse<object?>>(StatusCodes.Status403Forbidden)
            .RequireAuthorization("AdminOnly");

        group.MapPost("{hotelId:int}/room-types", CreateRoomType)
            .WithSummary("Create a room type for a hotel")
            .Produces<ApiResponse<int>>(StatusCodes.Status201Created)
            .Produces<ApiResponse<object?>>(StatusCodes.Status400BadRequest)
            .Produces<ApiResponse<object?>>(StatusCodes.Status401Unauthorized)
            .Produces<ApiResponse<object?>>(StatusCodes.Status403Forbidden)
            .Produces<ApiResponse<object?>>(StatusCodes.Status404NotFound)
            .RequireAuthorization("AdminOnly");

        group.MapPut("{id:int}", UpdateHotel)
            .WithSummary("Update a hotel")
            .Produces<ApiResponse<object?>>(StatusCodes.Status200OK)
            .Produces<ApiResponse<object?>>(StatusCodes.Status400BadRequest)
            .Produces<ApiResponse<object?>>(StatusCodes.Status401Unauthorized)
            .Produces<ApiResponse<object?>>(StatusCodes.Status403Forbidden)
            .Produces<ApiResponse<object?>>(StatusCodes.Status404NotFound)
            .RequireAuthorization("AdminOnly");

        group.MapDelete("{id:int}", DeleteHotel)
            .WithSummary("Delete a hotel")
            .Produces<ApiResponse<object?>>(StatusCodes.Status200OK)
            .Produces<ApiResponse<object?>>(StatusCodes.Status404NotFound)
            .Produces<ApiResponse<object?>>(StatusCodes.Status409Conflict)
            .Produces<ApiResponse<object?>>(StatusCodes.Status401Unauthorized)
            .Produces<ApiResponse<object?>>(StatusCodes.Status403Forbidden)
            .RequireAuthorization("AdminOnly");
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

    private static async Task<IResult> GetHotelDetails(
        int hotelId,
        ISender sender,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(new GetHotelDetailsQuery(hotelId), cancellationToken);
        return result.ToHttpResult();
    }

    private static async Task<IResult> GetHotelAvailability(
        int id,
        DateOnly checkIn,
        DateOnly checkOut,
        int? numberOfGuests,
        int? numberOfRooms,
        ISender sender,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(new GetHotelAvailabilityQuery
        {
            HotelId = id,
            CheckIn = checkIn,
            CheckOut = checkOut,
            NumberOfGuests = numberOfGuests,
            NumberOfRooms = numberOfRooms
        }, cancellationToken);
        return result.ToHttpResult();
    }

    private static async Task<IResult> GetHotelInventory(
        int hotelId,
        DateOnly from,
        DateOnly to,
        ISender sender,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(new GetHotelInventoryQuery
        {
            HotelId = hotelId,
            From = from,
            To = to
        }, cancellationToken);
        return result.ToHttpResult();
    }

    private static async Task<IResult> GetAvailableHotels(
        [AsParameters] GetAvailableHotelsQuery query,
        ISender sender,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(query, cancellationToken);
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

    private static async Task<IResult> CreateRoomType(
        int hotelId,
        [FromBody] CreateRoomTypeCommand body,
        ISender sender,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(body with { HotelId = hotelId }, cancellationToken);
        return result.ToCreatedHttpResult($"/api/v1/room-types/{result.Value}");
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
}

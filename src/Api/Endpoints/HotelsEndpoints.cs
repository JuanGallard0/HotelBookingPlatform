using HotelBookingPlatform.Application.Common.Models;
using HotelBookingPlatform.Application.Hotels.Commands.CreateHotel;
using HotelBookingPlatform.Application.Hotels.Commands.DeleteHotel;
using HotelBookingPlatform.Application.Hotels.Commands.UpdateHotel;
using HotelBookingPlatform.Application.Hotels.Queries.GetHotelById;
using HotelBookingPlatform.Application.Hotels.Queries.GetHotels;
using Microsoft.AspNetCore.Mvc;

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
}

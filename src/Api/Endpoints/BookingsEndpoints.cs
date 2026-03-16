using HotelBookingPlatform.Application.Bookings.Commands.CancelBooking;
using HotelBookingPlatform.Application.Bookings.Commands.ConfirmBooking;
using HotelBookingPlatform.Application.Bookings.Commands.CreateBooking;
using HotelBookingPlatform.Application.Bookings.Queries.GetBookingById;
using HotelBookingPlatform.Application.Bookings.Queries.GetUserBookings;
using HotelBookingPlatform.Application.Common.Models;
using Microsoft.AspNetCore.Mvc;

namespace HotelBookingPlatform.Api.Endpoints;

public class BookingsEndpoints : EndpointGroupBase
{
    public override string GroupName => "bookings";

    public override void Map(RouteGroupBuilder group)
    {
        group.MapGet("me", GetUserBookings)
            .WithSummary("Get bookings for the current user")
            .Produces<ApiResponse<PagedResponse<UserBookingDto>>>(StatusCodes.Status200OK)
            .Produces<ApiResponse<object?>>(StatusCodes.Status400BadRequest)
            .Produces<ApiResponse<object?>>(StatusCodes.Status401Unauthorized)
            .RequireAuthorization();

        group.MapGet("{id:int}", GetBookingById)
            .WithSummary("Get booking detail for the current user")
            .Produces<ApiResponse<BookingDetailsDto>>(StatusCodes.Status200OK)
            .Produces<ApiResponse<object?>>(StatusCodes.Status400BadRequest)
            .Produces<ApiResponse<object?>>(StatusCodes.Status401Unauthorized)
            .Produces<ApiResponse<object?>>(StatusCodes.Status404NotFound)
            .RequireAuthorization();

        group.MapPost(CreateBooking)
            .WithIdempotency<CreateBookingCommand>()
            .RequireRateLimiting(RateLimitingPolicyNames.BookingWrite)
            .WithSummary("Create a booking")
            .Produces<ApiResponse<BookingDto>>(StatusCodes.Status201Created)
            .Produces<ApiResponse<object?>>(StatusCodes.Status400BadRequest)
            .Produces<ApiResponse<object?>>(StatusCodes.Status401Unauthorized)
            .Produces<ApiResponse<object?>>(StatusCodes.Status404NotFound)
            .Produces<ApiResponse<object?>>(StatusCodes.Status409Conflict)
            .Produces<ApiResponse<object?>>(StatusCodes.Status422UnprocessableEntity)
            .Produces<ApiResponse<object?>>(StatusCodes.Status429TooManyRequests)
            .RequireAuthorization();

        group.MapPost("{id:int}/confirm", ConfirmBooking)
            .RequireRateLimiting(RateLimitingPolicyNames.BookingWrite)
            .WithSummary("Confirm a booking")
            .Produces<ApiResponse<object?>>(StatusCodes.Status200OK)
            .Produces<ApiResponse<object?>>(StatusCodes.Status400BadRequest)
            .Produces<ApiResponse<object?>>(StatusCodes.Status401Unauthorized)
            .Produces<ApiResponse<object?>>(StatusCodes.Status403Forbidden)
            .Produces<ApiResponse<object?>>(StatusCodes.Status404NotFound)
            .Produces<ApiResponse<object?>>(StatusCodes.Status422UnprocessableEntity)
            .Produces<ApiResponse<object?>>(StatusCodes.Status429TooManyRequests)
            .RequireAuthorization();

        group.MapPost("{id:int}/cancel", CancelBooking)
            .RequireRateLimiting(RateLimitingPolicyNames.BookingWrite)
            .WithSummary("Cancel a booking")
            .Produces<ApiResponse<object?>>(StatusCodes.Status200OK)
            .Produces<ApiResponse<object?>>(StatusCodes.Status400BadRequest)
            .Produces<ApiResponse<object?>>(StatusCodes.Status401Unauthorized)
            .Produces<ApiResponse<object?>>(StatusCodes.Status403Forbidden)
            .Produces<ApiResponse<object?>>(StatusCodes.Status404NotFound)
            .Produces<ApiResponse<object?>>(StatusCodes.Status422UnprocessableEntity)
            .Produces<ApiResponse<object?>>(StatusCodes.Status429TooManyRequests)
            .RequireAuthorization();
    }

    private static async Task<IResult> GetUserBookings(
        [AsParameters] GetUserBookingsQuery query,
        ISender sender,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(query, cancellationToken);
        return result.ToHttpResult();
    }

    private static async Task<IResult> GetBookingById(
        int id,
        ISender sender,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(new GetBookingByIdQuery(id), cancellationToken);
        return result.ToHttpResult();
    }

    private static async Task<IResult> CreateBooking(
        [FromHeader(Name = "Idempotency-Key")] string? _,
        [FromBody] CreateBookingCommand body,
        ISender sender,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(body, cancellationToken);
        return result.ToCreatedHttpResult($"/api/v1/bookings/{result.Value?.BookingNumber}");
    }

    private static async Task<IResult> ConfirmBooking(
        int id,
        ISender sender,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(new ConfirmBookingCommand(id), cancellationToken);
        return result.ToHttpResult();
    }

    private static async Task<IResult> CancelBooking(
        int id,
        [FromBody] CancelBookingRequest body,
        ISender sender,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(new CancelBookingCommand(id, body.Reason), cancellationToken);
        return result.ToHttpResult();
    }
}

public record CancelBookingRequest(string Reason);

using HotelBookingPlatform.Application.Bookings.Commands.CreateBooking;
using Microsoft.AspNetCore.Mvc;

namespace HotelBookingPlatform.Api.Endpoints;

public class BookingsEndpoints : EndpointGroupBase
{
    public override string GroupName => "bookings";

    public override void Map(RouteGroupBuilder group)
    {
        group.MapPost(CreateBooking)
            .WithIdempotency<CreateBookingCommand>()
            .WithSummary("Create a booking")
            .Produces<ApiResponse<BookingDto>>(StatusCodes.Status201Created)
            .Produces<ApiResponse<object?>>(StatusCodes.Status400BadRequest)
            .Produces<ApiResponse<object?>>(StatusCodes.Status401Unauthorized)
            .Produces<ApiResponse<object?>>(StatusCodes.Status404NotFound)
            .Produces<ApiResponse<object?>>(StatusCodes.Status409Conflict)
            .Produces<ApiResponse<object?>>(StatusCodes.Status422UnprocessableEntity)
            .RequireAuthorization();
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
}

using HotelBookingPlatform.Application.Common.Exceptions;
using HotelBookingPlatform.Application.Common.Models;
using HotelBookingPlatform.Domain.Exceptions;
using Microsoft.AspNetCore.Diagnostics;

namespace HotelBookingPlatform.Api.Infrastructure;

public class CustomExceptionHandler : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(HttpContext httpContext, Exception exception, CancellationToken cancellationToken)
    {
        if (exception is ValidationException validationEx)
        {
            await TypedResults.Json(
                ApiResponse<object?>.ValidationFail(
                    "One or more validation failures have occurred.",
                    validationEx.Errors.AsReadOnly()),
                statusCode: StatusCodes.Status400BadRequest)
                .ExecuteAsync(httpContext);
            return true;
        }

        var result = MapToResult(exception);
        if (result is null) return false;

        await result.ToHttpResult().ExecuteAsync(httpContext);
        return true;
    }

    private static Result? MapToResult(Exception exception) => exception switch
    {
        NotFoundException ex => Result.NotFound(ex.Message),
        UnauthorizedAccessException => Result.Unauthorized(),
        ForbiddenAccessException => Result.Forbidden(),
        BadHttpRequestException ex => Result.Failure(ex.Message),
        BookingStatusException ex => Result.Conflict(ex.Message),
        InsufficientInventoryException ex => Result.Conflict(ex.Message),
        InvalidBookingDatesException ex => Result.UnprocessableEntity(ex.Message),
        InvalidOperationException ex => Result.Failure(ex.Message),
        _ => Result.Failure("An unexpected error occurred.")
    };
}

using HotelBookingPlatform.Application.Common.Exceptions;
using HotelBookingPlatform.Application.Common.Models;
using HotelBookingPlatform.Domain.Exceptions;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.EntityFrameworkCore;

namespace HotelBookingPlatform.Api.Infrastructure;

public class CustomExceptionHandler(ILogger<CustomExceptionHandler> logger) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(HttpContext httpContext, Exception exception, CancellationToken cancellationToken)
    {
        if (exception is ValidationException validationEx)
        {
            logger.LogWarning(
                exception,
                "Validation failure for {Method} {Path}",
                httpContext.Request.Method,
                httpContext.Request.Path);

            await TypedResults.Json(
                ApiResponse<object?>.ValidationFail(
                    "One or more validation failures have occurred.",
                    validationEx.Errors.AsReadOnly()),
                statusCode: StatusCodes.Status400BadRequest)
                .ExecuteAsync(httpContext);
            return true;
        }

        if (exception is BadHttpRequestException badHttpEx)
        {
            logger.LogWarning(
                exception,
                "Bad HTTP request for {Method} {Path}",
                httpContext.Request.Method,
                httpContext.Request.Path);

            await TypedResults.BadRequest(
                ApiResponse<object?>.Fail(badHttpEx.Message, "BAD_REQUEST"))
                .ExecuteAsync(httpContext);
            return true;
        }

        var result = MapToResult(exception);
        if (result is null) return false;

        logger.LogError(
            exception,
            "Handled exception {ExceptionType} for {Method} {Path}",
            exception.GetType().FullName,
            httpContext.Request.Method,
            httpContext.Request.Path);

        await result.ToHttpResult().ExecuteAsync(httpContext);
        return true;
    }

    private static Result? MapToResult(Exception exception) => exception switch
    {
        NotFoundException ex => Result.NotFound(ex.Message),
        UnauthorizedAccessException => Result.Unauthorized(),
        ForbiddenAccessException => Result.Forbidden(),
        BookingStatusException ex => Result.Conflict(ex.Message),
        InsufficientInventoryException ex => Result.Conflict(ex.Message),
        DbUpdateConcurrencyException => Result.Conflict("The resource was updated by another request. Refresh and try again."),
        InvalidBookingDatesException ex => Result.UnprocessableEntity(ex.Message),
        _ => null
    };
}

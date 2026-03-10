using HotelBookingPlatform.Application.Common.Models;

namespace HotelBookingPlatform.Api.Infrastructure;

public static class ResultExtensions
{
    public static IResult ToHttpResult<T>(this Result<T> result)
    {
        if (result.Succeeded)
            return Execute(ResultErrorType.None, ApiResponse<T>.Ok(result.Value!));

        return Execute(result.ErrorType, ApiResponse<T>.Fail(string.Join("; ", result.Errors), result.ErrorCode));
    }

    public static IResult ToHttpResult(this Result result)
    {
        if (result.Succeeded)
            return Execute(ResultErrorType.None, ApiResponse<object?>.Ok(null));

        return Execute(result.ErrorType, ApiResponse<object?>.Fail(string.Join("; ", result.Errors), result.ErrorCode));
    }

    public static IResult ToCreatedHttpResult<T>(this Result<T> result, string uri)
    {
        if (result.Succeeded)
            return TypedResults.Created(uri, ApiResponse<T>.Ok(result.Value!));

        return Execute(result.ErrorType, ApiResponse<T>.Fail(string.Join("; ", result.Errors), result.ErrorCode));
    }

    private static IResult Execute<T>(ResultErrorType errorType, ApiResponse<T> response) => errorType switch
    {
        ResultErrorType.None                => TypedResults.Ok(response),
        ResultErrorType.NotFound            => TypedResults.NotFound(response),
        ResultErrorType.Conflict            => TypedResults.Conflict(response),
        ResultErrorType.UnprocessableEntity => TypedResults.UnprocessableEntity(response),
        ResultErrorType.Unauthorized        => TypedResults.Json(response, statusCode: StatusCodes.Status401Unauthorized),
        ResultErrorType.Forbidden           => TypedResults.Json(response, statusCode: StatusCodes.Status403Forbidden),
        _                                   => TypedResults.BadRequest(response)
    };
}

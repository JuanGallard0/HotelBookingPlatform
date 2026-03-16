namespace HotelBookingPlatform.Application.Common.Models;

public enum ResultErrorType
{
    None,
    Validation,
    NotFound,
    Conflict,
    UnprocessableEntity,
    Unauthorized,
    Forbidden
}

public class Result
{
    internal Result(bool succeeded, IEnumerable<string> errors, ResultErrorType errorType = ResultErrorType.None)
    {
        Succeeded = succeeded;
        Errors = errors.ToArray();
        ErrorType = errorType;
    }

    public bool Succeeded { get; init; }
    public string[] Errors { get; init; }
    public ResultErrorType ErrorType { get; init; }

    public string? ErrorCode => ErrorType switch
    {
        ResultErrorType.Validation => "VALIDATION_ERROR",
        ResultErrorType.NotFound => "NOT_FOUND",
        ResultErrorType.Conflict => "CONFLICT",
        ResultErrorType.UnprocessableEntity => "UNPROCESSABLE_ENTITY",
        ResultErrorType.Unauthorized => "UNAUTHORIZED",
        ResultErrorType.Forbidden => "FORBIDDEN",
        _ => null
    };

    public static Result Success() => new(true, Array.Empty<string>());
    public static Result Failure(IEnumerable<string> errors) => new(false, errors);
    public static Result Failure(string error) => new(false, [error]);
    public static Result NotFound(string error) => new(false, [error], ResultErrorType.NotFound);
    public static Result Conflict(string error) => new(false, [error], ResultErrorType.Conflict);
    public static Result UnprocessableEntity(string error) => new(false, [error], ResultErrorType.UnprocessableEntity);
    public static Result Unauthorized() => new(false, ["Unauthorized."], ResultErrorType.Unauthorized);
    public static Result Forbidden() => new(false, ["Forbidden."], ResultErrorType.Forbidden);
}

public class Result<T> : Result
{
    private Result(bool succeeded, T? value, IEnumerable<string> errors, ResultErrorType errorType = ResultErrorType.None)
        : base(succeeded, errors, errorType)
    {
        Value = value;
    }

    public T? Value { get; init; }

    public static Result<T> Success(T value) => new(true, value, Array.Empty<string>());
    public new static Result<T> Failure(IEnumerable<string> errors) => new(false, default, errors);
    public new static Result<T> Failure(string error) => new(false, default, [error]);
    public new static Result<T> NotFound(string error) => new(false, default, [error], ResultErrorType.NotFound);
    public new static Result<T> Conflict(string error) => new(false, default, [error], ResultErrorType.Conflict);
    public new static Result<T> UnprocessableEntity(string error) => new(false, default, [error], ResultErrorType.UnprocessableEntity);
    public new static Result<T> Unauthorized() => new(false, default, ["Unauthorized."], ResultErrorType.Unauthorized);
    public new static Result<T> Forbidden() => new(false, default, ["Forbidden."], ResultErrorType.Forbidden);
}

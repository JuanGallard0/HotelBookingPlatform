namespace HotelBookingPlatform.Api.Infrastructure;

public record ApiResponse<T>
{
    public bool Success { get; init; }
    public T? Data { get; init; }
    public string? ErrorMessage { get; init; }
    public string? ErrorCode { get; init; }
    public IReadOnlyDictionary<string, string[]>? ValidationErrors { get; init; }

    public static ApiResponse<T> Ok(T data) => new()
    {
        Success = true,
        Data = data
    };

    public static ApiResponse<T> Fail(string errorMessage, string? errorCode = null) => new()
    {
        Success = false,
        ErrorMessage = errorMessage,
        ErrorCode = errorCode
    };

    public static ApiResponse<T> ValidationFail(
        string errorMessage,
        IReadOnlyDictionary<string, string[]> validationErrors) => new()
    {
        Success = false,
        ErrorMessage = errorMessage,
        ErrorCode = "VALIDATION_ERROR",
        ValidationErrors = validationErrors
    };
}

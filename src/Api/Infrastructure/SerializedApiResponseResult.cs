namespace HotelBookingPlatform.Api.Infrastructure;

public sealed class SerializedApiResponseResult(
    int statusCode,
    string responseBody,
    string? resourceLocation = null,
    string? contentType = null,
    IReadOnlyDictionary<string, string[]>? headers = null) : IResult
{
    public async Task ExecuteAsync(HttpContext httpContext)
    {
        httpContext.Response.StatusCode = statusCode;
        httpContext.Response.ContentType = contentType ?? "application/json; charset=utf-8";

        if (headers is not null)
        {
            foreach (var header in headers)
            {
                if (ShouldSkipHeader(header.Key))
                    continue;

                httpContext.Response.Headers[header.Key] = header.Value;
            }
        }

        if (!string.IsNullOrWhiteSpace(resourceLocation))
            httpContext.Response.Headers.Location = resourceLocation;

        await httpContext.Response.WriteAsync(responseBody);
    }

    private static bool ShouldSkipHeader(string headerName)
        => headerName.Equals("Content-Length", StringComparison.OrdinalIgnoreCase)
           || headerName.Equals("Transfer-Encoding", StringComparison.OrdinalIgnoreCase)
           || headerName.Equals("Server", StringComparison.OrdinalIgnoreCase)
           || headerName.Equals("Date", StringComparison.OrdinalIgnoreCase)
           || headerName.Equals("Content-Type", StringComparison.OrdinalIgnoreCase);
}

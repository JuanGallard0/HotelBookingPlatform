namespace HotelBookingPlatform.Api.Infrastructure;

internal sealed record CapturedHttpResponse(
    int StatusCode,
    string Body,
    string? ContentType,
    IReadOnlyDictionary<string, string[]> Headers,
    string? ResourceLocation)
{
    public static async Task<CapturedHttpResponse> FromAsync(
        IResult result,
        HttpContext sourceHttpContext,
        CancellationToken cancellationToken)
    {
        var captureContext = new DefaultHttpContext
        {
            RequestServices = sourceHttpContext.RequestServices
        };

        await using var bodyStream = new MemoryStream();
        captureContext.Response.Body = bodyStream;

        await result.ExecuteAsync(captureContext);
        await captureContext.Response.Body.FlushAsync(cancellationToken);

        bodyStream.Position = 0;
        using var reader = new StreamReader(bodyStream, leaveOpen: true);
        var body = await reader.ReadToEndAsync(cancellationToken);

        return new CapturedHttpResponse(
            captureContext.Response.StatusCode,
            body,
            captureContext.Response.ContentType,
            CaptureHeaders(captureContext.Response.Headers),
            captureContext.Response.Headers.Location.ToString());
    }

    public IResult ToResult()
        => new SerializedApiResponseResult(StatusCode, Body, ResourceLocation, ContentType, Headers);

    private static IReadOnlyDictionary<string, string[]> CaptureHeaders(IHeaderDictionary headers)
        => headers
            .Where(header => !ShouldSkipHeader(header.Key))
            .ToDictionary(
                header => header.Key,
                header => header.Value.Select(value => value ?? string.Empty).ToArray(),
                StringComparer.OrdinalIgnoreCase);

    private static bool ShouldSkipHeader(string headerName)
        => headerName.Equals("Content-Length", StringComparison.OrdinalIgnoreCase)
           || headerName.Equals("Transfer-Encoding", StringComparison.OrdinalIgnoreCase)
           || headerName.Equals("Server", StringComparison.OrdinalIgnoreCase)
           || headerName.Equals("Date", StringComparison.OrdinalIgnoreCase);
}

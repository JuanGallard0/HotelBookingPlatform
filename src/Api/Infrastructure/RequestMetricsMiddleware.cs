using System.Diagnostics;
using System.Diagnostics.Metrics;
using System.Globalization;

namespace HotelBookingPlatform.Api.Infrastructure;

public sealed class RequestMetricsMiddleware(RequestDelegate next)
{
    private const string ResponseTimeHeaderName = "X-Response-Time-Ms";

    private static readonly Meter Meter = new("HotelBookingPlatform.Api", "1.0.0");
    private static readonly Counter<long> RequestCount = Meter.CreateCounter<long>(
        "http.server.request.count",
        description: "Total HTTP requests handled by the API.");
    private static readonly Histogram<double> RequestDuration = Meter.CreateHistogram<double>(
        "http.server.request.duration",
        unit: "ms",
        description: "HTTP request duration in milliseconds.");

    public async Task InvokeAsync(HttpContext context)
    {
        var startedAt = Stopwatch.GetTimestamp();

        try
        {
            await next(context);
        }
        finally
        {
            var elapsedMs = Stopwatch.GetElapsedTime(startedAt).TotalMilliseconds;

            if (!context.Response.HasStarted)
            {
                context.Response.Headers[ResponseTimeHeaderName] =
                    elapsedMs.ToString("0.###", CultureInfo.InvariantCulture);
            }

            var route = context.GetEndpoint() is RouteEndpoint routeEndpoint
                ? routeEndpoint.RoutePattern.RawText ?? context.Request.Path.Value ?? "/"
                : context.Request.Path.Value ?? "/";

            var tags = new TagList
            {
                { "http.request.method", context.Request.Method },
                { "http.response.status_code", context.Response.StatusCode },
                { "http.route", route },
                { "correlation_id", RequestCorrelationMiddleware.GetCorrelationId(context) },
                { "trace_id", Activity.Current?.TraceId.ToString() }
            };

            RequestCount.Add(1, tags);
            RequestDuration.Record(elapsedMs, tags);
        }
    }
}

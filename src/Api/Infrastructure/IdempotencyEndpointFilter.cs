using HotelBookingPlatform.Application.Common.Interfaces;
using HotelBookingPlatform.Application.Common.Models;

namespace HotelBookingPlatform.Api.Infrastructure;

internal sealed class IdempotencyEndpointFilter<TRequest>(
    IdempotencyFilterOptions<TRequest> options,
    EndpointFilterDelegate next)
{
    public async ValueTask<object?> InvokeAsync(EndpointFilterInvocationContext invocationContext)
    {
        var httpContext = invocationContext.HttpContext;
        var idempotencyKey = httpContext.Request.Headers["Idempotency-Key"].FirstOrDefault();

        if (string.IsNullOrWhiteSpace(idempotencyKey))
            return await next(invocationContext);

        var request = invocationContext.Arguments.OfType<TRequest>().FirstOrDefault();

        if (request is null)
            return await next(invocationContext);

        var idempotencyService = httpContext.RequestServices.GetRequiredService<IIdempotencyService>();
        var cancellationToken = httpContext.RequestAborted;
        var requestPath = httpContext.Request.Path.Value ?? string.Empty;
        var requestHash = options.RequestHashFactory(request);
        var decision = await idempotencyService.BeginRequestAsync(
            idempotencyKey,
            requestPath,
            requestHash,
            cancellationToken);

        if (decision.Status == IdempotencyExecutionStatus.RequestMismatch)
        {
            return TypedResults.Conflict(
                ApiResponse<object?>.Fail(
                    "The supplied Idempotency-Key has already been used for a different request.",
                    "IDEMPOTENCY_KEY_REUSE"));
        }

        if (decision.Status == IdempotencyExecutionStatus.Replay && decision.Response is not null)
            return ToReplayResult(decision.Response);

        if (decision.Status == IdempotencyExecutionStatus.InProgress)
        {
            var completed = await idempotencyService.WaitForCompletedResponseAsync(
                idempotencyKey,
                options.InProgressTimeout,
                cancellationToken);

            return completed is not null
                ? ToReplayResult(completed)
                : TypedResults.Conflict(
                    ApiResponse<object?>.Fail(
                        "A request with the same Idempotency-Key is already in progress.",
                        "IDEMPOTENCY_KEY_IN_PROGRESS"));
        }

        try
        {
            var handlerResult = await next(invocationContext);

            if (handlerResult is not IResult httpResult)
                throw new InvalidOperationException("Idempotency filter requires endpoint handlers to return IResult.");

            var captured = await CapturedHttpResponse.FromAsync(httpResult, httpContext, cancellationToken);

            await idempotencyService.CompleteRequestAsync(
                idempotencyKey,
                requestHash,
                new ResponseSnapshot(
                    captured.StatusCode,
                    captured.Body,
                    captured.ContentType,
                    captured.Headers,
                    captured.ResourceLocation),
                cancellationToken);

            return captured.ToResult();
        }
        catch
        {
            await idempotencyService.AbandonRequestAsync(idempotencyKey, cancellationToken);
            throw;
        }
    }

    private static IResult ToReplayResult(StoredResponse response)
        => new SerializedApiResponseResult(
            response.StatusCode,
            response.ResponseBody,
            response.ResourceLocation,
            response.ContentType,
            response.Headers);
}

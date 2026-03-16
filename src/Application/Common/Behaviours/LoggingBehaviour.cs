using MediatR.Pipeline;
using Microsoft.Extensions.Logging;

namespace HotelBookingPlatform.Application.Common.Behaviours;

public class LoggingBehaviour<TRequest> : IRequestPreProcessor<TRequest>
    where TRequest : notnull
{
    private readonly ILogger _logger;

    public LoggingBehaviour(ILogger<TRequest> logger)
    {
        _logger = logger;
    }

    public Task Process(TRequest request, CancellationToken cancellationToken)
    {
        var requestName = typeof(TRequest).Name;

        if (typeof(TRequest).Namespace?.Contains(".Auth.", StringComparison.Ordinal) == true)
        {
            _logger.LogInformation("HotelBookingPlatform Request: {Name} [redacted]", requestName);
            return Task.CompletedTask;
        }

        _logger.LogInformation("HotelBookingPlatform Request: {Name} {@Request}", requestName, request);

        return Task.CompletedTask;
    }
}

using HotelBookingPlatform.Application.Common.Models;

namespace HotelBookingPlatform.Application.Common.Interfaces;

public interface IIdempotencyService
{
    Task<IdempotencyExecutionResult> BeginRequestAsync(
        string key,
        string requestPath,
        string requestHash,
        CancellationToken cancellationToken);

    Task<StoredResponse?> WaitForCompletedResponseAsync(
        string key,
        TimeSpan timeout,
        CancellationToken cancellationToken);

    Task CompleteRequestAsync(
        string key,
        string requestHash,
        ResponseSnapshot response,
        CancellationToken cancellationToken);

    Task AbandonRequestAsync(
        string key,
        CancellationToken cancellationToken);
}

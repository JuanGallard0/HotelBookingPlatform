using HotelBookingPlatform.Application.Common.Interfaces;
using HotelBookingPlatform.Application.Common.Models;

namespace HotelBookingPlatform.Application.Common.Behaviours;

public sealed class TransactionBehaviour<TRequest, TResponse>(IUnitOfWork unitOfWork)
    : IPipelineBehavior<TRequest, TResponse>
    where TRequest : notnull
{
    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken cancellationToken)
    {
        if (!ShouldWrapInTransaction() || unitOfWork.IsTransactionActive)
            return await next();

        await unitOfWork.BeginTransactionAsync(cancellationToken);

        try
        {
            var response = await next();

            if (response is Result result && !result.Succeeded)
            {
                await unitOfWork.RollbackAsync(cancellationToken);
                return response;
            }

            await unitOfWork.CommitAsync(cancellationToken);
            return response;
        }
        catch
        {
            await unitOfWork.RollbackAsync(CancellationToken.None);
            throw;
        }
    }

    private static bool ShouldWrapInTransaction()
        => typeof(TRequest).Namespace?.Contains(".Commands.", StringComparison.Ordinal) == true;
}

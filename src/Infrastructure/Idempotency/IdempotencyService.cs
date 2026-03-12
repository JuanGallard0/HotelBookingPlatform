using HotelBookingPlatform.Application.Common.Interfaces;
using HotelBookingPlatform.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace HotelBookingPlatform.Infrastructure.Idempotency;

internal sealed class IdempotencyService(
    IApplicationDbContext context,
    IUnitOfWork unitOfWork) : IIdempotencyService
{
    public async Task<string?> GetCachedResponseAsync(string key, CancellationToken cancellationToken)
    {
        var record = await context.IdempotencyRecords
            .FirstOrDefaultAsync(r => r.IdempotencyKey == key, cancellationToken);

        return record is not null && !record.IsExpired()
            ? record.ResponseBody
            : null;
    }

    public async Task StoreAsync(
        string key,
        string requestPath,
        int statusCode,
        string responseBody,
        CancellationToken cancellationToken)
    {
        context.IdempotencyRecords.Add(
            IdempotencyRecord.Create(key, requestPath, statusCode, responseBody));

        await unitOfWork.SaveChangesAsync(cancellationToken);
    }
}

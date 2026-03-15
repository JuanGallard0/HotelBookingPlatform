using System.Text.Json;
using HotelBookingPlatform.Application.Common.Interfaces;
using HotelBookingPlatform.Application.Common.Models;
using HotelBookingPlatform.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace HotelBookingPlatform.Infrastructure.Idempotency;

internal sealed class IdempotencyService(
    IApplicationDbContext context,
    IUnitOfWork unitOfWork) : IIdempotencyService
{
    public async Task<IdempotencyExecutionResult> BeginRequestAsync(
        string key,
        string requestPath,
        string requestHash,
        CancellationToken cancellationToken)
    {
        var existing = await context.IdempotencyRecords
            .FirstOrDefaultAsync(r => r.IdempotencyKey == key, cancellationToken);

        if (existing is not null)
        {
            if (existing.IsExpired())
            {
                context.IdempotencyRecords.Remove(existing);
                await unitOfWork.SaveChangesAsync(cancellationToken);
            }
            else
            {
                return CreateDecision(existing, requestPath, requestHash);
            }
        }

        context.IdempotencyRecords.Add(IdempotencyRecord.Create(key, requestPath, requestHash));

        try
        {
            await unitOfWork.SaveChangesAsync(cancellationToken);
            return new IdempotencyExecutionResult(IdempotencyExecutionStatus.Started);
        }
        catch (DbUpdateException)
        {
            ResetTrackedReservationAsync(key);

            var current = await context.IdempotencyRecords
                .FirstOrDefaultAsync(r => r.IdempotencyKey == key, cancellationToken);

            if (current is null)
                throw;

            return CreateDecision(current, requestPath, requestHash);
        }
    }

    public async Task<StoredResponse?> WaitForCompletedResponseAsync(
        string key,
        TimeSpan timeout,
        CancellationToken cancellationToken)
    {
        var startedAt = DateTimeOffset.UtcNow;

        while (DateTimeOffset.UtcNow - startedAt < timeout)
        {
            cancellationToken.ThrowIfCancellationRequested();

            var record = await context.IdempotencyRecords
                .AsNoTracking()
                .FirstOrDefaultAsync(r => r.IdempotencyKey == key, cancellationToken);

            if (record is null)
                return null;

            if (record.IsExpired())
                return null;

            if (record.IsCompleted())
                return Map(record);

            await Task.Delay(TimeSpan.FromMilliseconds(200), cancellationToken);
        }

        return null;
    }

    public async Task CompleteRequestAsync(
        string key,
        string requestHash,
        ResponseSnapshot response,
        CancellationToken cancellationToken)
    {
        var record = await context.IdempotencyRecords
            .FirstOrDefaultAsync(r => r.IdempotencyKey == key, cancellationToken)
            ?? throw new InvalidOperationException($"No idempotency reservation exists for key '{key}'.");

        if (!string.Equals(record.RequestHash, requestHash, StringComparison.Ordinal))
            throw new InvalidOperationException($"Idempotency request hash mismatch for key '{key}'.");

        record.Complete(
            response.StatusCode,
            response.ResponseBody,
            response.ContentType,
            JsonSerializer.Serialize(response.Headers),
            response.ResourceLocation);
        await unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task AbandonRequestAsync(string key, CancellationToken cancellationToken)
    {
        var record = await context.IdempotencyRecords
            .FirstOrDefaultAsync(r => r.IdempotencyKey == key, cancellationToken);

        if (record is null || record.IsCompleted())
            return;

        context.IdempotencyRecords.Remove(record);
        await unitOfWork.SaveChangesAsync(cancellationToken);
    }

    private static IdempotencyExecutionResult CreateDecision(
        IdempotencyRecord record,
        string requestPath,
        string requestHash)
    {
        if (!string.Equals(record.RequestPath, requestPath, StringComparison.Ordinal)
            || !string.Equals(record.RequestHash, requestHash, StringComparison.Ordinal))
        {
            return new IdempotencyExecutionResult(IdempotencyExecutionStatus.RequestMismatch, Map(record));
        }

        if (record.IsCompleted())
            return new IdempotencyExecutionResult(IdempotencyExecutionStatus.Replay, Map(record));

        return new IdempotencyExecutionResult(IdempotencyExecutionStatus.InProgress);
    }

    private static StoredResponse Map(IdempotencyRecord record)
        => new(
            record.IdempotencyKey,
            record.RequestPath,
            record.RequestHash,
            record.ResponseStatusCode,
            record.ResponseBody,
            record.ResponseContentType,
            DeserializeHeaders(record.ResponseHeadersJson),
            record.ResourceLocation,
            record.ExpiresAt);

    private static IReadOnlyDictionary<string, string[]> DeserializeHeaders(string? headersJson)
    {
        if (string.IsNullOrWhiteSpace(headersJson))
            return new Dictionary<string, string[]>();

        return JsonSerializer.Deserialize<Dictionary<string, string[]>>(headersJson)
            ?? new Dictionary<string, string[]>();
    }

    private void ResetTrackedReservationAsync(string key)
    {
        var trackedEntries = context.IdempotencyRecords.Local
            .Where(r => r.IdempotencyKey == key)
            .ToList();

        foreach (var tracked in trackedEntries)
        {
            context.IdempotencyRecords.Remove(tracked);
        }
    }
}

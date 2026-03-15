using System.Collections.Concurrent;
using HotelBookingPlatform.Application.Common.Interfaces;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace HotelBookingPlatform.Infrastructure.Caching;

public sealed class AvailabilityCache(
    IMemoryCache memoryCache,
    IOptions<AvailabilityCacheOptions> options,
    ILogger<AvailabilityCache> logger) : IAvailabilityCache
{
    private readonly ConcurrentDictionary<string, SemaphoreSlim> _locks = new();
    private int _generation;

    public async Task<T> GetOrCreateAsync<T>(
        string cacheKey,
        Func<CancellationToken, Task<T>> factory,
        CancellationToken cancellationToken = default)
    {
        var settings = options.Value;

        if (!settings.Enabled || settings.TtlSeconds <= 0)
        {
            return await factory(cancellationToken);
        }

        var scopedKey = BuildScopedKey(cacheKey);

        if (memoryCache.TryGetValue(scopedKey, out T? cached) && cached is not null)
        {
            return cached;
        }

        var gate = _locks.GetOrAdd(scopedKey, static _ => new SemaphoreSlim(1, 1));
        await gate.WaitAsync(cancellationToken);

        try
        {
            if (memoryCache.TryGetValue(scopedKey, out cached) && cached is not null)
            {
                return cached;
            }

            var value = await factory(cancellationToken);
            memoryCache.Set(scopedKey, value, TimeSpan.FromSeconds(settings.TtlSeconds));
            return value;
        }
        finally
        {
            gate.Release();
            _locks.TryRemove(scopedKey, out _);
        }
    }

    public void InvalidateAll()
    {
        Interlocked.Increment(ref _generation);
        logger.LogInformation("Availability cache invalidated.");
    }

    private string BuildScopedKey(string cacheKey) =>
        $"availability:v{Volatile.Read(ref _generation)}:{cacheKey}";
}

namespace HotelBookingPlatform.Application.Common.Interfaces;

public interface IAvailabilityCache
{
    Task<T> GetOrCreateAsync<T>(
        string cacheKey,
        Func<CancellationToken, Task<T>> factory,
        CancellationToken cancellationToken = default);

    void InvalidateAll();
}

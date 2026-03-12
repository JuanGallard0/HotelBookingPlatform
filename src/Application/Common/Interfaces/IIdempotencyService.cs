namespace HotelBookingPlatform.Application.Common.Interfaces;

public interface IIdempotencyService
{
    Task<string?> GetCachedResponseAsync(string key, CancellationToken cancellationToken);

    Task StoreAsync(
        string key,
        string requestPath,
        int statusCode,
        string responseBody,
        CancellationToken cancellationToken);
}

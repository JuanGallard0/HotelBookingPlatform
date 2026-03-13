using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

namespace HotelBookingPlatform.Api.Infrastructure;

public static class IdempotencyEndpointFilterExtensions
{
    public static RouteHandlerBuilder WithIdempotency<TRequest>(
        this RouteHandlerBuilder builder,
        Action<IdempotencyFilterOptions<TRequest>>? configure = null)
    {
        var options = new IdempotencyFilterOptions<TRequest>();
        configure?.Invoke(options);

        builder.AddEndpointFilterFactory((_, next) =>
        {
            return async invocationContext =>
            {
                var filter = new IdempotencyEndpointFilter<TRequest>(options, next);
                return await filter.InvokeAsync(invocationContext);
            };
        });

        return builder;
    }
}

public sealed class IdempotencyFilterOptions<TRequest>
{
    public TimeSpan InProgressTimeout { get; set; } = TimeSpan.FromSeconds(5);
    public Func<TRequest, string> RequestHashFactory { get; set; } = CreateDefaultHash;

    private static string CreateDefaultHash(TRequest request)
    {
        var payload = JsonSerializer.Serialize(request);
        var hashBytes = SHA256.HashData(Encoding.UTF8.GetBytes(payload));
        return Convert.ToHexString(hashBytes);
    }
}

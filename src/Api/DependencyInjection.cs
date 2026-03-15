using System.Globalization;
using System.Threading.RateLimiting;
using Azure.Identity;
using HotelBookingPlatform.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;

namespace Microsoft.Extensions.DependencyInjection;

public static class DependencyInjection
{
    public static void AddWebServices(this IHostApplicationBuilder builder)
    {
        builder.Services.AddDatabaseDeveloperPageExceptionFilter();

        builder.Services.AddHttpContextAccessor();
        builder.Services.AddHealthChecks()
            .AddDbContextCheck<ApplicationDbContext>();

        builder.Services.AddExceptionHandler<CustomExceptionHandler>();

        builder.Services.Configure<ApiBehaviorOptions>(options =>
            options.SuppressModelStateInvalidFilter = true);

        builder.Services.AddEndpointsApiExplorer();
        builder.Services.Configure<ApiRateLimitingOptions>(
            builder.Configuration.GetSection(ApiRateLimitingOptions.SectionName));

        var rateLimitingOptions =
            builder.Configuration.GetSection(ApiRateLimitingOptions.SectionName).Get<ApiRateLimitingOptions>()
            ?? new ApiRateLimitingOptions();

        builder.Services.AddRateLimiter(options =>
        {
            options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
            options.OnRejected = async (context, cancellationToken) =>
            {
                if (context.Lease.TryGetMetadata(MetadataName.RetryAfter, out var retryAfter))
                {
                    context.HttpContext.Response.Headers.RetryAfter =
                        Math.Ceiling(retryAfter.TotalSeconds).ToString(CultureInfo.InvariantCulture);
                }

                await TypedResults.Json(
                        ApiResponse<object?>.Fail(
                            "Too many requests. Please retry later.",
                            "RATE_LIMIT_EXCEEDED"),
                        statusCode: StatusCodes.Status429TooManyRequests)
                    .ExecuteAsync(context.HttpContext);
            };

            options.AddPolicy(
                RateLimitingPolicyNames.Auth,
                context => CreateFixedWindowLimiter(
                    GetAnonymousPartitionKey(context),
                    rateLimitingOptions.Auth));

            options.AddPolicy(
                RateLimitingPolicyNames.BookingWrite,
                context => CreateFixedWindowLimiter(
                    GetUserOrIpPartitionKey(context),
                    rateLimitingOptions.BookingWrite));
        });

        builder.Services.AddOpenApi(options =>
        {
            options.AddOperationTransformer<ApiExceptionOperationTransformer>();
        });
    }

    public static void AddKeyVaultIfConfigured(this IHostApplicationBuilder builder)
    {
        var keyVaultUri = builder.Configuration["AZURE_KEY_VAULT_ENDPOINT"];
        if (!string.IsNullOrWhiteSpace(keyVaultUri))
        {
            builder.Configuration.AddAzureKeyVault(
                new Uri(keyVaultUri),
                new DefaultAzureCredential());
        }
    }

    private static RateLimitPartition<string> CreateFixedWindowLimiter(
        string partitionKey,
        ApiRateLimitingOptions.PolicySettings settings) =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey,
            _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = settings.PermitLimit,
                Window = TimeSpan.FromMinutes(settings.WindowMinutes),
                QueueLimit = 0,
                QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                AutoReplenishment = true
            });

    private static string GetAnonymousPartitionKey(HttpContext context)
    {
        var forwardedFor = context.Request.Headers["X-Forwarded-For"].ToString();
        if (!string.IsNullOrWhiteSpace(forwardedFor))
        {
            var forwardedIp = forwardedFor.Split(',', StringSplitOptions.TrimEntries | StringSplitOptions.RemoveEmptyEntries)
                .FirstOrDefault();

            if (!string.IsNullOrWhiteSpace(forwardedIp))
            {
                return $"anon:{forwardedIp}";
            }
        }

        var ip = context.Connection.RemoteIpAddress?.ToString() ?? "unknown-ip";
        return $"anon:{ip}";
    }

    private static string GetUserOrIpPartitionKey(HttpContext context)
    {
        var userId = context.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (!string.IsNullOrWhiteSpace(userId))
        {
            return $"user:{userId}";
        }

        return GetAnonymousPartitionKey(context);
    }
}

using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using HotelBookingPlatform.Api.Infrastructure;
using HotelBookingPlatform.Application.Auth.Commands.RegisterUser;
using HotelBookingPlatform.Application.Auth.Common;
using Shouldly;

namespace HotelBookingPlatform.Application.FunctionalTests.RateLimiting;

using static Testing;

[TestFixture]
public class RateLimitingTests : BaseTestFixture
{
    [Test]
    public async Task Register_ExceedingAnonymousLimit_ReturnsTooManyRequests()
    {
        using var client = CreateClient();
        client.DefaultRequestHeaders.Add("X-Forwarded-For", "198.51.100.10");

        HttpStatusCode[] statuses = new HttpStatusCode[6];

        for (var index = 0; index < 6; index++)
        {
            var response = await client.PostAsJsonAsync(
                "/api/v1/auth/register",
                new RegisterUserCommand(
                    $"ratelimit-register-{index}-{Guid.NewGuid():N}@example.com",
                    "Rate",
                    "Limit",
                    "Password123!"));

            statuses[index] = response.StatusCode;
        }

        statuses.Take(5).ShouldAllBe(status => status == HttpStatusCode.OK);
        statuses[5].ShouldBe(HttpStatusCode.TooManyRequests);
    }

    [Test]
    public async Task ConfirmBooking_ExceedingAuthenticatedLimit_ReturnsTooManyRequests()
    {
        using var client = CreateClient();
        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", await RegisterAndAuthenticateAsync(client));

        HttpStatusCode[] statuses = new HttpStatusCode[11];
        ApiResponse<object?>? throttledPayload = null;

        for (var index = 0; index < 11; index++)
        {
            var response = await client.PostAsync("/api/v1/bookings/999999/confirm", null);
            statuses[index] = response.StatusCode;

            if (response.StatusCode == HttpStatusCode.TooManyRequests)
            {
                throttledPayload = await response.Content.ReadFromJsonAsync<ApiResponse<object?>>();
            }
        }

        statuses.Take(10).ShouldAllBe(status => status == HttpStatusCode.NotFound);
        statuses[10].ShouldBe(HttpStatusCode.TooManyRequests);
        throttledPayload.ShouldNotBeNull();
        throttledPayload.ErrorCode.ShouldBe("RATE_LIMIT_EXCEEDED");
    }

    private static async Task<string> RegisterAndAuthenticateAsync(HttpClient client)
    {
        var email = $"ratelimit-user-{Guid.NewGuid():N}@example.com";
        var response = await client.PostAsJsonAsync(
            "/api/v1/auth/register",
            new RegisterUserCommand(email, "Rate", "User", "Password123!"));

        response.StatusCode.ShouldBe(HttpStatusCode.OK);

        var payload = await response.Content.ReadFromJsonAsync<ApiResponse<AuthResponseDto>>();
        payload.ShouldNotBeNull();
        payload.Data.ShouldNotBeNull();
        return payload.Data.AccessToken;
    }
}

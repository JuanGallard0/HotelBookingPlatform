using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using HotelBookingPlatform.Api.Infrastructure;
using HotelBookingPlatform.Application.Auth.Commands.RegisterUser;
using HotelBookingPlatform.Application.Auth.Common;
using HotelBookingPlatform.Application.Bookings.Commands.CreateBooking;
using HotelBookingPlatform.Domain.Entities;
using Shouldly;

namespace HotelBookingPlatform.Application.FunctionalTests.Bookings;

using static Testing;

[TestFixture]
public class CreateBookingIdempotencyTests : BaseTestFixture
{
    [Test]
    public async Task CreateBooking_WithSameIdempotencyKey_ReplaysOriginalResponse()
    {
        var roomTypeId = await SeedBookableRoomTypeAsync();
        using var client = CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", await RegisterAndAuthenticateAsync(client));

        var command = CreateCommand(roomTypeId, "guest-replay@example.com");
        var key = Guid.NewGuid().ToString("N");

        var first = await SendCreateBookingAsync(client, command, key);
        var firstBody = await first.Content.ReadAsStringAsync();

        var second = await SendCreateBookingAsync(client, command, key);
        var secondBody = await second.Content.ReadAsStringAsync();

        first.StatusCode.ShouldBe(HttpStatusCode.Created);
        second.StatusCode.ShouldBe(HttpStatusCode.Created);
        secondBody.ShouldBe(firstBody);
        second.Headers.Location.ShouldNotBeNull();
        second.Headers.Location.ShouldBe(first.Headers.Location);
        (await CountAsync<Booking>()).ShouldBe(1);
    }

    [Test]
    public async Task CreateBooking_WithSameIdempotencyKeyAndDifferentPayload_ReturnsConflict()
    {
        var roomTypeId = await SeedBookableRoomTypeAsync();
        using var client = CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", await RegisterAndAuthenticateAsync(client));

        var key = Guid.NewGuid().ToString("N");
        var firstCommand = CreateCommand(roomTypeId, "guest-mismatch@example.com");
        var secondCommand = firstCommand with { NumberOfRooms = 2 };

        var first = await SendCreateBookingAsync(client, firstCommand, key);
        var second = await SendCreateBookingAsync(client, secondCommand, key);
        var secondPayload = await second.Content.ReadFromJsonAsync<ApiResponse<object?>>();

        first.StatusCode.ShouldBe(HttpStatusCode.Created);
        second.StatusCode.ShouldBe(HttpStatusCode.Conflict);
        secondPayload.ShouldNotBeNull();
        secondPayload.ErrorCode.ShouldBe("IDEMPOTENCY_KEY_REUSE");
        (await CountAsync<Booking>()).ShouldBe(1);
    }

    private static async Task<HttpResponseMessage> SendCreateBookingAsync(
        HttpClient client,
        CreateBookingCommand command,
        string idempotencyKey)
    {
        var request = new HttpRequestMessage(HttpMethod.Post, "/api/v1/bookings")
        {
            Content = JsonContent.Create(command)
        };
        request.Headers.Add("Idempotency-Key", idempotencyKey);
        return await client.SendAsync(request);
    }

    private static CreateBookingCommand CreateCommand(int roomTypeId, string guestEmail)
    {
        var checkIn = DateOnly.FromDateTime(DateTime.UtcNow.Date.AddDays(5));

        return new CreateBookingCommand
        {
            RoomTypeId = roomTypeId,
            CheckIn = checkIn,
            CheckOut = checkIn.AddDays(2),
            NumberOfGuests = 2,
            NumberOfRooms = 1,
            Guest = new GuestInfoDto(
                "Test",
                "Guest",
                guestEmail,
                "+50370000000"),
            SpecialRequests = "Late check-in"
        };
    }

    private static async Task<int> SeedBookableRoomTypeAsync()
    {
        var checkIn = DateOnly.FromDateTime(DateTime.UtcNow.Date.AddDays(5));
        var roomTypeId = 0;

        await ExecuteDbContextAsync(async context =>
        {
            var hotel = new Hotel
            {
                Name = $"Hotel {Guid.NewGuid():N}",
                Description = "Functional test hotel",
                Address = "San Salvador",
                City = "San Salvador",
                Country = "El Salvador",
                Email = $"hotel-{Guid.NewGuid():N}@example.com",
                PhoneNumber = "+50370000001",
                StarRating = 4,
                IsActive = true
            };

            context.Hotels.Add(hotel);
            await context.SaveChangesAsync();

            var roomType = new RoomType
            {
                HotelId = hotel.Id,
                Name = "Standard",
                Description = "Functional test room",
                MaxOccupancy = 2,
                BasePrice = 125m,
                IsActive = true
            };

            context.RoomTypes.Add(roomType);
            await context.SaveChangesAsync();

            context.RoomInventories.AddRange(
                new RoomInventory
                {
                    RoomTypeId = roomType.Id,
                    Date = checkIn,
                    TotalRooms = 3,
                    AvailableRooms = 3
                },
                new RoomInventory
                {
                    RoomTypeId = roomType.Id,
                    Date = checkIn.AddDays(1),
                    TotalRooms = 3,
                    AvailableRooms = 3
                });

            context.RatePlans.Add(new RatePlan
            {
                RoomTypeId = roomType.Id,
                Name = "BAR",
                Description = "Best available rate",
                ValidFrom = checkIn.AddDays(-2),
                ValidTo = checkIn.AddDays(5),
                PricePerNight = 125m,
                IsActive = true
            });

            roomTypeId = roomType.Id;
        });

        return roomTypeId;
    }

    private static async Task<string> RegisterAndAuthenticateAsync(HttpClient client)
    {
        var email = $"user-{Guid.NewGuid():N}@example.com";
        var response = await client.PostAsJsonAsync(
            "/api/v1/auth/register",
            new RegisterUserCommand(email, "Test", "User", "Password123!"));

        response.StatusCode.ShouldBe(HttpStatusCode.OK);

        var payload = await response.Content.ReadFromJsonAsync<ApiResponse<AuthResponseDto>>();
        payload.ShouldNotBeNull();
        payload.Data.ShouldNotBeNull();
        return payload.Data.AccessToken;
    }
}

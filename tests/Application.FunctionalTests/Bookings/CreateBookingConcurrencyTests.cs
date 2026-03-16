using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using HotelBookingPlatform.Api.Infrastructure;
using HotelBookingPlatform.Application.Auth.Commands.RegisterUser;
using HotelBookingPlatform.Application.Auth.Common;
using HotelBookingPlatform.Application.Bookings.Commands.CreateBooking;
using HotelBookingPlatform.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Shouldly;

namespace HotelBookingPlatform.Application.FunctionalTests.Bookings;

using static Testing;

[TestFixture]
public class CreateBookingConcurrencyTests : BaseTestFixture
{
    [Test]
    public async Task CreateBooking_WithConcurrentRequests_AllowsOnlyOneReservationForLimitedInventory()
    {
        var roomTypeId = await SeedSingleRoomInventoryAsync();
        var accessToken = await RegisterAndAuthenticateAsync();
        const int requestCount = 6;

        var startGate = new TaskCompletionSource(TaskCreationOptions.RunContinuationsAsynchronously);

        var tasks = Enumerable.Range(0, requestCount)
            .Select(index => Task.Run(async () =>
            {
                using var client = CreateClient();
                client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

                var request = new HttpRequestMessage(HttpMethod.Post, "/api/v1/bookings")
                {
                    Content = JsonContent.Create(CreateCommand(roomTypeId, $"guest-concurrency-{index}@example.com"))
                };

                request.Headers.Add("Idempotency-Key", Guid.NewGuid().ToString("N"));

                await startGate.Task;
                return await client.SendAsync(request);
            }))
            .ToArray();

        startGate.SetResult();

        var responses = await Task.WhenAll(tasks);
        var statusCodes = responses.Select(response => response.StatusCode).ToArray();
        var responseBodies = await Task.WhenAll(responses.Select(response => response.Content.ReadAsStringAsync()));

        statusCodes.Count(code => code == HttpStatusCode.Created).ShouldBe(1, string.Join(Environment.NewLine,
            statusCodes.Zip(responseBodies, (status, body) => $"{(int)status} {status}: {body}")));
        statusCodes.Count(code => code is HttpStatusCode.Conflict or HttpStatusCode.UnprocessableEntity)
            .ShouldBe(requestCount - 1, string.Join(Environment.NewLine,
                statusCodes.Zip(responseBodies, (status, body) => $"{(int)status} {status}: {body}")));

        (await CountAsync<Booking>()).ShouldBe(1);
        (await CountAsync<Guest>()).ShouldBe(1);

        var inventorySnapshot = new List<InventorySnapshot>();

        await ExecuteDbContextAsync(async context =>
        {
            inventorySnapshot = await context.RoomInventories
                .Where(ri => ri.RoomTypeId == roomTypeId)
                .OrderBy(ri => ri.Date)
                .Select(ri => new InventorySnapshot(ri.Date, ri.AvailableRooms, ri.TotalRooms))
                .ToListAsync();
        });

        inventorySnapshot.Count.ShouldBe(2);
        inventorySnapshot.All(day => day.AvailableRooms >= 0).ShouldBeTrue();
        inventorySnapshot.All(day => day.AvailableRooms == 0).ShouldBeTrue();
        inventorySnapshot.All(day => day.TotalRooms == 1).ShouldBeTrue();
    }

    [Test]
    public async Task CreateBooking_WithConcurrentRequestsAndSameIdempotencyKey_ReplaysOriginalCreatedResponse()
    {
        var roomTypeId = await SeedAbundantRoomInventoryAsync();
        var accessToken = await RegisterAndAuthenticateAsync();
        const int requestCount = 6;
        var sharedKey = Guid.NewGuid().ToString("N");
        var command = CreateCommand(roomTypeId, "guest-samekey@example.com");

        var startGate = new TaskCompletionSource(TaskCreationOptions.RunContinuationsAsynchronously);

        var tasks = Enumerable.Range(0, requestCount)
            .Select(_ => Task.Run(async () =>
            {
                using var client = CreateClient();
                client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

                var request = new HttpRequestMessage(HttpMethod.Post, "/api/v1/bookings")
                {
                    Content = JsonContent.Create(command)
                };

                request.Headers.Add("Idempotency-Key", sharedKey);

                await startGate.Task;
                return await client.SendAsync(request);
            }))
            .ToArray();

        startGate.SetResult();

        var responses = await Task.WhenAll(tasks);
        var statusCodes = responses.Select(r => r.StatusCode).ToArray();
        var responseBodies = await Task.WhenAll(responses.Select(response => response.Content.ReadAsStringAsync()));
        var locations = responses.Select(response => response.Headers.Location?.ToString()).ToArray();

        statusCodes.ShouldAllBe(code => code == HttpStatusCode.Created);
        responseBodies.Distinct().Count().ShouldBe(1, string.Join(Environment.NewLine,
            statusCodes.Zip(responseBodies, (status, body) => $"{(int)status} {status}: {body}")));
        locations.ShouldAllBe(location => !string.IsNullOrWhiteSpace(location));
        locations.Distinct().Count().ShouldBe(1, string.Join(Environment.NewLine,
            locations.Select(location => location ?? "<null>")));
        (await CountAsync<Booking>()).ShouldBe(1);
        (await CountAsync<Guest>()).ShouldBe(1);
    }

    private static async Task<int> SeedAbundantRoomInventoryAsync()
    {
        var checkIn = DateOnly.FromDateTime(DateTime.UtcNow.Date.AddDays(5));
        var roomTypeId = 0;

        await ExecuteDbContextAsync(async context =>
        {
            var hotel = new Hotel
            {
                Name = $"SameKey Hotel {Guid.NewGuid():N}",
                Description = "Same-key concurrency test hotel",
                Address = "San Salvador",
                City = "San Salvador",
                Country = "El Salvador",
                Email = $"hotel-samekey-{Guid.NewGuid():N}@example.com",
                PhoneNumber = "+50370000012",
                StarRating = 4,
                IsActive = true
            };

            context.Hotels.Add(hotel);
            await context.SaveChangesAsync();

            var roomType = new RoomType
            {
                HotelId = hotel.Id,
                Name = "SameKey Standard",
                Description = "Abundant room inventory",
                MaxOccupancy = 2,
                BasePrice = 150m,
                IsActive = true
            };

            context.RoomTypes.Add(roomType);
            await context.SaveChangesAsync();

            context.RoomInventories.AddRange(
                new RoomInventory { RoomTypeId = roomType.Id, Date = checkIn, TotalRooms = 10, AvailableRooms = 10 },
                new RoomInventory { RoomTypeId = roomType.Id, Date = checkIn.AddDays(1), TotalRooms = 10, AvailableRooms = 10 });

            context.RatePlans.Add(new RatePlan
            {
                RoomTypeId = roomType.Id,
                Name = "BAR",
                Description = "Best available rate",
                ValidFrom = checkIn.AddDays(-2),
                ValidTo = checkIn.AddDays(5),
                PricePerNight = 150m,
                IsActive = true
            });

            roomTypeId = roomType.Id;
        });

        return roomTypeId;
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
                "Concurrency",
                "Guest",
                guestEmail,
                "+50370000010"),
            SpecialRequests = "Concurrency test"
        };
    }

    private static async Task<int> SeedSingleRoomInventoryAsync()
    {
        var checkIn = DateOnly.FromDateTime(DateTime.UtcNow.Date.AddDays(5));
        var roomTypeId = 0;

        await ExecuteDbContextAsync(async context =>
        {
            var hotel = new Hotel
            {
                Name = $"Concurrency Hotel {Guid.NewGuid():N}",
                Description = "Concurrency test hotel",
                Address = "San Salvador",
                City = "San Salvador",
                Country = "El Salvador",
                Email = $"hotel-concurrency-{Guid.NewGuid():N}@example.com",
                PhoneNumber = "+50370000011",
                StarRating = 4,
                IsActive = true
            };

            context.Hotels.Add(hotel);
            await context.SaveChangesAsync();

            var roomType = new RoomType
            {
                HotelId = hotel.Id,
                Name = "Concurrency Standard",
                Description = "Single room inventory",
                MaxOccupancy = 2,
                BasePrice = 150m,
                IsActive = true
            };

            context.RoomTypes.Add(roomType);
            await context.SaveChangesAsync();

            context.RoomInventories.AddRange(
                new RoomInventory
                {
                    RoomTypeId = roomType.Id,
                    Date = checkIn,
                    TotalRooms = 1,
                    AvailableRooms = 1
                },
                new RoomInventory
                {
                    RoomTypeId = roomType.Id,
                    Date = checkIn.AddDays(1),
                    TotalRooms = 1,
                    AvailableRooms = 1
                });

            context.RatePlans.Add(new RatePlan
            {
                RoomTypeId = roomType.Id,
                Name = "BAR",
                Description = "Best available rate",
                ValidFrom = checkIn.AddDays(-2),
                ValidTo = checkIn.AddDays(5),
                PricePerNight = 150m,
                IsActive = true
            });

            roomTypeId = roomType.Id;
        });

        return roomTypeId;
    }

    private static async Task<string> RegisterAndAuthenticateAsync()
    {
        using var client = CreateClient();

        var email = $"user-concurrency-{Guid.NewGuid():N}@example.com";
        var response = await client.PostAsJsonAsync(
            "/api/v1/auth/register",
            new RegisterUserCommand(email, "Concurrency", "User", "Password123!"));

        response.StatusCode.ShouldBe(HttpStatusCode.OK);

        var payload = await response.Content.ReadFromJsonAsync<ApiResponse<AuthResponseDto>>();
        payload.ShouldNotBeNull();
        payload.Data.ShouldNotBeNull();
        return payload.Data.AccessToken;
    }

    private sealed record InventorySnapshot(DateOnly Date, int AvailableRooms, int TotalRooms);
}

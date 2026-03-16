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
public class CreateBookingHappyPathTests : BaseTestFixture
{
    [Test]
    public async Task CreateBooking_WithValidRequest_CreatesBookingAndDecrementsInventory()
    {
        var roomTypeId = await SeedBookableRoomTypeAsync();
        using var client = CreateClient();
        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", await RegisterAndAuthenticateAsync(client));

        var command = CreateCommand(roomTypeId, "guest-happy@example.com");
        var request = new HttpRequestMessage(HttpMethod.Post, "/api/v1/bookings")
        {
            Content = JsonContent.Create(command)
        };
        request.Headers.Add("Idempotency-Key", Guid.NewGuid().ToString("N"));

        var response = await client.SendAsync(request);
        var payload = await response.Content.ReadFromJsonAsync<ApiResponse<BookingDto>>();

        response.StatusCode.ShouldBe(HttpStatusCode.Created);
        response.Headers.Location.ShouldNotBeNull();
        payload.ShouldNotBeNull();
        payload.Success.ShouldBeTrue();
        payload.Data.ShouldNotBeNull();
        payload.Data.RoomTypeName.ShouldBe("Happy Path Standard");
        payload.Data.NumberOfRooms.ShouldBe(1);
        payload.Data.NumberOfGuests.ShouldBe(2);
        payload.Data.Nights.ShouldBe(2);
        payload.Data.SpecialRequests.ShouldBe("Happy path test");
        payload.Data.BookingNumber.ShouldNotBeNullOrWhiteSpace();

        (await CountAsync<Booking>()).ShouldBe(1);
        (await CountAsync<Guest>()).ShouldBe(1);

        var inventories = new List<RoomInventory>();
        await ExecuteDbContextAsync(async context =>
        {
            inventories = await context.RoomInventories
                .Where(ri => ri.RoomTypeId == roomTypeId)
                .OrderBy(ri => ri.Date)
                .ToListAsync();
        });

        inventories.Count.ShouldBe(2);
        inventories.All(ri => ri.AvailableRooms == 2).ShouldBeTrue();
        inventories.All(ri => ri.TotalRooms == 3).ShouldBeTrue();
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
                "Happy",
                "Guest",
                guestEmail,
                "+50370000020"),
            SpecialRequests = "Happy path test"
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
                Name = $"Happy Path Hotel {Guid.NewGuid():N}",
                Description = "Happy path functional test hotel",
                Address = "San Salvador",
                City = "San Salvador",
                Country = "El Salvador",
                Email = $"hotel-happy-{Guid.NewGuid():N}@example.com",
                PhoneNumber = "+50370000021",
                StarRating = 4,
                IsActive = true
            };

            context.Hotels.Add(hotel);
            await context.SaveChangesAsync();

            var roomType = new RoomType
            {
                HotelId = hotel.Id,
                Name = "Happy Path Standard",
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
        client.DefaultRequestHeaders.Remove("X-Forwarded-For");
        client.DefaultRequestHeaders.Add("X-Forwarded-For", "198.51.100.50");

        var email = $"user-happy-{Guid.NewGuid():N}@example.com";
        var response = await client.PostAsJsonAsync(
            "/api/v1/auth/register",
            new RegisterUserCommand(email, "Happy", "User", "Password123!"));

        response.StatusCode.ShouldBe(HttpStatusCode.OK);

        var payload = await response.Content.ReadFromJsonAsync<ApiResponse<AuthResponseDto>>();
        payload.ShouldNotBeNull();
        payload.Data.ShouldNotBeNull();
        return payload.Data.AccessToken;
    }
}

using HotelBookingPlatform.Application.Hotels.Queries;
using HotelBookingPlatform.Application.Hotels.Queries.GetAvailableHotels;
using HotelBookingPlatform.Infrastructure.Caching;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Moq;
using NUnit.Framework;
using Shouldly;

namespace HotelBookingPlatform.Application.UnitTests.Hotels.Queries;

public class GetAvailableHotelsQueryHandlerCacheTests
{
    [Test]
    public async Task Handle_ReusesCachedAvailabilityUntilInvalidated()
    {
        var queryService = new Mock<IHotelQueryService>();
        queryService
            .Setup(x => x.GetAvailableHotelsAsync(It.IsAny<GetAvailableHotelsQuery>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((
                (IReadOnlyList<AvailableHotelDto>)
                [
                    new AvailableHotelDto
                    {
                        HotelId = 7,
                        Name = "Cached Hotel",
                        City = "San Salvador",
                        Country = "El Salvador",
                        PricePerNightFrom = 99m
                    }
                ],
                1));

        using var memoryCache = new MemoryCache(new MemoryCacheOptions());
        var availabilityCache = new AvailabilityCache(
            memoryCache,
            Options.Create(new AvailabilityCacheOptions
            {
                Enabled = true,
                TtlSeconds = 60
            }),
            Mock.Of<ILogger<AvailabilityCache>>());

        var handler = new GetAvailableHotelsQueryHandler(queryService.Object, availabilityCache);
        var query = new GetAvailableHotelsQuery
        {
            Search = "cached",
            CheckIn = DateOnly.FromDateTime(DateTime.UtcNow.Date.AddDays(5)),
            CheckOut = DateOnly.FromDateTime(DateTime.UtcNow.Date.AddDays(7)),
            NumberOfGuests = 2,
            NumberOfRooms = 1
        };

        var first = await handler.Handle(query, CancellationToken.None);
        var second = await handler.Handle(query, CancellationToken.None);

        first.Succeeded.ShouldBeTrue();
        second.Succeeded.ShouldBeTrue();
        queryService.Verify(
            x => x.GetAvailableHotelsAsync(It.IsAny<GetAvailableHotelsQuery>(), It.IsAny<CancellationToken>()),
            Times.Once);

        availabilityCache.InvalidateAll();

        var third = await handler.Handle(query, CancellationToken.None);

        third.Succeeded.ShouldBeTrue();
        queryService.Verify(
            x => x.GetAvailableHotelsAsync(It.IsAny<GetAvailableHotelsQuery>(), It.IsAny<CancellationToken>()),
            Times.Exactly(2));
    }
}

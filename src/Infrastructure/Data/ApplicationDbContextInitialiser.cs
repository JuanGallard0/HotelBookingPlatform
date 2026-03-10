using HotelBookingPlatform.Domain.Entities;
using HotelBookingPlatform.Domain.Enums;
using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace HotelBookingPlatform.Infrastructure.Data;

public static class InitialiserExtensions
{
    public static async Task InitialiseDatabaseAsync(this WebApplication app)
    {
        using var scope = app.Services.CreateScope();

        var initialiser = scope.ServiceProvider.GetRequiredService<ApplicationDbContextInitialiser>();

        await initialiser.InitialiseAsync();
        await initialiser.SeedAsync();
    }
}

public class ApplicationDbContextInitialiser
{
    private readonly ILogger<ApplicationDbContextInitialiser> _logger;
    private readonly ApplicationDbContext _context;

    public ApplicationDbContextInitialiser(ILogger<ApplicationDbContextInitialiser> logger, ApplicationDbContext context)
    {
        _logger = logger;
        _context = context;
    }

    public async Task InitialiseAsync()
    {
        try
        {
            await _context.Database.MigrateAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while initialising the database.");
            throw;
        }
    }

    public async Task SeedAsync()
    {
        try
        {
            await TrySeedAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while seeding the database.");
            throw;
        }
    }

    private async Task TrySeedAsync()
    {
        if (_context.Hotels.Any()) return;

        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        // ── Hotels ────────────────────────────────────────────────────────────
        var grandPlaza = new Hotel
        {
            Name = "Grand Plaza Hotel",
            Description = "A luxurious 5-star hotel in the heart of the city, featuring world-class amenities and breathtaking views.",
            Address = "123 Grand Avenue",
            City = "New York",
            Country = "USA",
            Email = "info@grandplaza.com",
            PhoneNumber = "+1-212-555-0100",
            StarRating = 5,
            IsActive = true
        };

        var cityViewInn = new Hotel
        {
            Name = "City View Inn",
            Description = "A comfortable 3-star hotel offering great value and easy access to the city's top attractions.",
            Address = "456 Main Street",
            City = "New York",
            Country = "USA",
            Email = "info@cityviewinn.com",
            PhoneNumber = "+1-212-555-0200",
            StarRating = 3,
            IsActive = true
        };

        _context.Hotels.AddRange(grandPlaza, cityViewInn);
        await _context.SaveChangesAsync();

        // ── Room Types ────────────────────────────────────────────────────────
        var gpStandard = new RoomType
        {
            HotelId = grandPlaza.Id,
            Name = "Standard Room",
            Description = "Elegantly furnished room with a king-size bed, city view, and premium amenities.",
            MaxOccupancy = 2,
            BasePrice = 150.00m,
            IsActive = true
        };

        var gpDeluxe = new RoomType
        {
            HotelId = grandPlaza.Id,
            Name = "Deluxe Suite",
            Description = "Spacious suite with a separate living area, panoramic city views, and a jacuzzi.",
            MaxOccupancy = 4,
            BasePrice = 350.00m,
            IsActive = true
        };

        var gpPresidential = new RoomType
        {
            HotelId = grandPlaza.Id,
            Name = "Presidential Suite",
            Description = "The ultimate luxury experience with a private terrace, butler service, and exclusive lounge access.",
            MaxOccupancy = 6,
            BasePrice = 800.00m,
            IsActive = true
        };

        var cvStandard = new RoomType
        {
            HotelId = cityViewInn.Id,
            Name = "Standard Room",
            Description = "Cozy room with a queen-size bed, flat-screen TV, and free Wi-Fi.",
            MaxOccupancy = 2,
            BasePrice = 80.00m,
            IsActive = true
        };

        var cvFamily = new RoomType
        {
            HotelId = cityViewInn.Id,
            Name = "Family Room",
            Description = "Spacious room with two double beds, perfect for families with children.",
            MaxOccupancy = 4,
            BasePrice = 130.00m,
            IsActive = true
        };

        _context.RoomTypes.AddRange(gpStandard, gpDeluxe, gpPresidential, cvStandard, cvFamily);
        await _context.SaveChangesAsync();

        // ── Rate Plans ────────────────────────────────────────────────────────
        var yearStart = new DateOnly(today.Year, 1, 1);
        var yearEnd = new DateOnly(today.Year, 12, 31);

        _context.RatePlans.AddRange(
            new RatePlan
            {
                RoomTypeId = gpStandard.Id,
                Name = "Standard Rate",
                Description = "Best available rate for Standard Room.",
                ValidFrom = yearStart,
                ValidTo = yearEnd,
                PricePerNight = 150.00m,
                IsActive = true
            },
            new RatePlan
            {
                RoomTypeId = gpStandard.Id,
                Name = "Advance Purchase",
                Description = "10% discount when booking 14+ days in advance.",
                ValidFrom = yearStart,
                ValidTo = yearEnd,
                PricePerNight = 150.00m,
                DiscountPercentage = 10.00m,
                IsActive = true
            },
            new RatePlan
            {
                RoomTypeId = gpDeluxe.Id,
                Name = "Standard Rate",
                Description = "Best available rate for Deluxe Suite.",
                ValidFrom = yearStart,
                ValidTo = yearEnd,
                PricePerNight = 350.00m,
                IsActive = true
            },
            new RatePlan
            {
                RoomTypeId = gpDeluxe.Id,
                Name = "Weekend Special",
                Description = "15% discount on weekend stays (Fri–Sun).",
                ValidFrom = yearStart,
                ValidTo = yearEnd,
                PricePerNight = 350.00m,
                DiscountPercentage = 15.00m,
                IsActive = true
            },
            new RatePlan
            {
                RoomTypeId = gpPresidential.Id,
                Name = "Standard Rate",
                Description = "Best available rate for Presidential Suite.",
                ValidFrom = yearStart,
                ValidTo = yearEnd,
                PricePerNight = 800.00m,
                IsActive = true
            },
            new RatePlan
            {
                RoomTypeId = cvStandard.Id,
                Name = "Standard Rate",
                Description = "Best available rate for Standard Room.",
                ValidFrom = yearStart,
                ValidTo = yearEnd,
                PricePerNight = 80.00m,
                IsActive = true
            },
            new RatePlan
            {
                RoomTypeId = cvStandard.Id,
                Name = "Long Stay Discount",
                Description = "20% discount for stays of 7 nights or more.",
                ValidFrom = yearStart,
                ValidTo = yearEnd,
                PricePerNight = 80.00m,
                DiscountPercentage = 20.00m,
                IsActive = true
            },
            new RatePlan
            {
                RoomTypeId = cvFamily.Id,
                Name = "Standard Rate",
                Description = "Best available rate for Family Room.",
                ValidFrom = yearStart,
                ValidTo = yearEnd,
                PricePerNight = 130.00m,
                IsActive = true
            }
        );

        await _context.SaveChangesAsync();

        // ── Room Inventory (next 90 days) ─────────────────────────────────────
        var roomCapacities = new[]
        {
            (RoomTypeId: gpStandard.Id,     TotalRooms: 20),
            (RoomTypeId: gpDeluxe.Id,       TotalRooms: 10),
            (RoomTypeId: gpPresidential.Id, TotalRooms: 3),
            (RoomTypeId: cvStandard.Id,     TotalRooms: 30),
            (RoomTypeId: cvFamily.Id,       TotalRooms: 15),
        };

        var inventoryRecords = new List<RoomInventory>();
        for (var i = 0; i < 90; i++)
        {
            var date = today.AddDays(i);
            foreach (var (roomTypeId, totalRooms) in roomCapacities)
            {
                inventoryRecords.Add(new RoomInventory
                {
                    RoomTypeId = roomTypeId,
                    Date = date,
                    TotalRooms = totalRooms,
                    AvailableRooms = totalRooms
                });
            }
        }

        _context.RoomInventories.AddRange(inventoryRecords);
        await _context.SaveChangesAsync();

        // ── Guests ────────────────────────────────────────────────────────────
        var john = new Guest
        {
            FirstName = "John",
            LastName = "Smith",
            Email = "john.smith@email.com",
            PhoneNumber = "+1-555-0101",
            DocumentType = "Passport",
            DocumentNumber = "US123456",
            DateOfBirth = new DateOnly(1985, 6, 15),
            Nationality = "American"
        };

        var sarah = new Guest
        {
            FirstName = "Sarah",
            LastName = "Johnson",
            Email = "sarah.johnson@email.com",
            PhoneNumber = "+1-555-0102",
            DocumentType = "Passport",
            DocumentNumber = "US789012",
            DateOfBirth = new DateOnly(1990, 3, 22),
            Nationality = "American"
        };

        var michael = new Guest
        {
            FirstName = "Michael",
            LastName = "Davis",
            Email = "michael.davis@email.com",
            PhoneNumber = "+44-7700-900123",
            DocumentType = "Passport",
            DocumentNumber = "GB345678",
            DateOfBirth = new DateOnly(1978, 11, 8),
            Nationality = "British"
        };

        _context.Guests.AddRange(john, sarah, michael);
        await _context.SaveChangesAsync();

        // ── Bookings & Payments ───────────────────────────────────────────────
        var booking1 = Booking.Create(
            bookingNumber: "BK-2026-0001",
            guestId: john.Id,
            roomTypeId: gpStandard.Id,
            checkInDate: today.AddDays(14),
            checkOutDate: today.AddDays(17),
            numberOfGuests: 2,
            numberOfRooms: 1,
            totalAmount: 450.00m,
            specialRequests: "High floor preferred, early check-in if possible."
        );
        booking1.Confirm();

        var booking2 = Booking.Create(
            bookingNumber: "BK-2026-0002",
            guestId: sarah.Id,
            roomTypeId: cvFamily.Id,
            checkInDate: today.AddDays(7),
            checkOutDate: today.AddDays(9),
            numberOfGuests: 3,
            numberOfRooms: 1,
            totalAmount: 260.00m
        );

        var booking3 = Booking.Create(
            bookingNumber: "BK-2026-0003",
            guestId: michael.Id,
            roomTypeId: gpDeluxe.Id,
            checkInDate: today.AddDays(30),
            checkOutDate: today.AddDays(35),
            numberOfGuests: 2,
            numberOfRooms: 1,
            totalAmount: 1750.00m,
            specialRequests: "Anniversary stay — please arrange flowers and champagne."
        );
        booking3.Confirm();

        _context.Bookings.AddRange(booking1, booking2, booking3);
        await _context.SaveChangesAsync();

        _context.Payments.AddRange(
            new Payment
            {
                BookingId = booking1.Id,
                TransactionId = "TXN-20260001",
                Amount = 450.00m,
                Currency = "USD",
                PaymentMethod = PaymentMethod.CreditCard,
                Status = PaymentStatus.Captured,
                ProcessedAt = DateTimeOffset.UtcNow.AddDays(-1)
            },
            new Payment
            {
                BookingId = booking3.Id,
                TransactionId = "TXN-20260002",
                Amount = 1750.00m,
                Currency = "USD",
                PaymentMethod = PaymentMethod.CreditCard,
                Status = PaymentStatus.Authorized,
                ProcessedAt = DateTimeOffset.UtcNow
            }
        );

        await _context.SaveChangesAsync();
    }
}

using HotelBookingPlatform.Domain.Entities;

namespace HotelBookingPlatform.Application.Common.Interfaces;

public interface IApplicationDbContext
{
    DbSet<Hotel> Hotels { get; }
    DbSet<RoomType> RoomTypes { get; }
    DbSet<RoomInventory> RoomInventories { get; }
    DbSet<RatePlan> RatePlans { get; }
    DbSet<Guest> Guests { get; }
    DbSet<Booking> Bookings { get; }
    DbSet<Payment> Payments { get; }
    DbSet<AuditLog> AuditLogs { get; }
    DbSet<IdempotencyRecord> IdempotencyRecords { get; }
    DbSet<User> Users { get; }
    DbSet<RefreshToken> RefreshTokens { get; }
}

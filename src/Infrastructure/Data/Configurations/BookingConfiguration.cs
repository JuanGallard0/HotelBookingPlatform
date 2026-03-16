using HotelBookingPlatform.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HotelBookingPlatform.Infrastructure.Data.Configurations;

public class BookingConfiguration : IEntityTypeConfiguration<Booking>
{
    public void Configure(EntityTypeBuilder<Booking> builder)
    {
        builder.HasKey(b => b.Id);

        builder.Property(b => b.BookingNumber)
            .IsRequired()
            .HasMaxLength(30);

        builder.Property(b => b.CheckInDate)
            .IsRequired();

        builder.Property(b => b.CheckOutDate)
            .IsRequired();

        builder.Property(b => b.NumberOfGuests)
            .IsRequired();

        builder.Property(b => b.NumberOfRooms)
            .IsRequired();

        builder.Property(b => b.TotalAmount)
            .IsRequired()
            .HasPrecision(18, 2);

        builder.Property(b => b.Status)
            .IsRequired();

        builder.Property(b => b.SpecialRequests)
            .HasMaxLength(1000);

        builder.Property(b => b.CancellationReason)
            .HasMaxLength(500);

        builder.Property(b => b.RowVersion)
            .IsRowVersion()
            .IsConcurrencyToken();

        builder.Ignore(b => b.NumberOfNights);

        builder.HasIndex(b => b.BookingNumber)
            .IsUnique();

        builder.HasIndex(b => b.UserId);

        builder.HasOne(b => b.User)
            .WithMany(u => u.Bookings)
            .HasForeignKey(b => b.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(b => b.Guest)
            .WithMany(g => g.Bookings)
            .HasForeignKey(b => b.GuestId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(b => b.RoomType)
            .WithMany()
            .HasForeignKey(b => b.RoomTypeId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

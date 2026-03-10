using HotelBookingPlatform.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HotelBookingPlatform.Infrastructure.Data.Configurations;

public class PaymentConfiguration : IEntityTypeConfiguration<Payment>
{
    public void Configure(EntityTypeBuilder<Payment> builder)
    {
        builder.ToTable("Payments", DbSchemas.Booking);

        builder.HasKey(p => p.Id);

        builder.Property(p => p.TransactionId)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(p => p.Amount)
            .IsRequired()
            .HasPrecision(18, 2);

        builder.Property(p => p.Currency)
            .IsRequired()
            .HasMaxLength(3)
            .HasDefaultValue("USD");

        builder.Property(p => p.PaymentMethod)
            .IsRequired();

        builder.Property(p => p.Status)
            .IsRequired();

        builder.Property(p => p.FailureReason)
            .HasMaxLength(500);

        builder.HasIndex(p => p.TransactionId)
            .IsUnique();

        builder.HasOne(p => p.Booking)
            .WithMany(b => b.Payments)
            .HasForeignKey(p => p.BookingId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

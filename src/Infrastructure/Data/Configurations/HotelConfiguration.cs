using HotelBookingPlatform.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HotelBookingPlatform.Infrastructure.Data.Configurations;

public class HotelConfiguration : IEntityTypeConfiguration<Hotel>
{
    public void Configure(EntityTypeBuilder<Hotel> builder)
    {
        builder.HasKey(h => h.Id);

        builder.Property(h => h.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(h => h.Description)
            .HasMaxLength(2000);

        builder.Property(h => h.Address)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(h => h.City)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(h => h.Country)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(h => h.Email)
            .IsRequired()
            .HasMaxLength(256);

        builder.Property(h => h.PhoneNumber)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(h => h.StarRating)
            .IsRequired();

        builder.Property(h => h.IsActive)
            .IsRequired()
            .HasDefaultValue(true);
    }
}

using HotelBookingPlatform.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HotelBookingPlatform.Infrastructure.Data.Configurations;

public class GuestConfiguration : IEntityTypeConfiguration<Guest>
{
    public void Configure(EntityTypeBuilder<Guest> builder)
    {
        builder.HasKey(g => g.Id);

        builder.Property(g => g.FirstName)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(g => g.LastName)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(g => g.Email)
            .IsRequired()
            .HasMaxLength(256);

        builder.Property(g => g.PhoneNumber)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(g => g.DocumentType)
            .HasMaxLength(50);

        builder.Property(g => g.DocumentNumber)
            .HasMaxLength(50);

        builder.Property(g => g.Nationality)
            .HasMaxLength(100);

        builder.Ignore(g => g.FullName);
    }
}

using HotelBookingPlatform.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HotelBookingPlatform.Infrastructure.Data.Configurations;

public class RatePlanConfiguration : IEntityTypeConfiguration<RatePlan>
{
    public void Configure(EntityTypeBuilder<RatePlan> builder)
    {
        builder.ToTable("RatePlans", DbSchemas.Catalog);

        builder.HasKey(rp => rp.Id);

        builder.Property(rp => rp.Name)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(rp => rp.Description)
            .HasMaxLength(1000);

        builder.Property(rp => rp.ValidFrom)
            .IsRequired();

        builder.Property(rp => rp.ValidTo)
            .IsRequired();

        builder.Property(rp => rp.PricePerNight)
            .IsRequired()
            .HasPrecision(18, 2);

        builder.Property(rp => rp.DiscountPercentage)
            .HasPrecision(5, 2);

        builder.Property(rp => rp.IsActive)
            .IsRequired()
            .HasDefaultValue(true);

        builder.HasOne(rp => rp.RoomType)
            .WithMany(rt => rt.RatePlans)
            .HasForeignKey(rp => rp.RoomTypeId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

using HotelBookingPlatform.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HotelBookingPlatform.Infrastructure.Data.Configurations;

public class IdempotencyRecordConfiguration : IEntityTypeConfiguration<IdempotencyRecord>
{
    public void Configure(EntityTypeBuilder<IdempotencyRecord> builder)
    {
        builder.HasKey(ir => ir.Id);

        builder.Property(ir => ir.IdempotencyKey)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(ir => ir.RequestPath)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(ir => ir.RequestHash)
            .HasMaxLength(64);

        builder.Property(ir => ir.ResponseStatusCode)
            .IsRequired();

        builder.Property(ir => ir.ResponseBody)
            .IsRequired()
            .HasColumnType("nvarchar(max)");

        builder.Property(ir => ir.ResponseContentType)
            .HasMaxLength(200);

        builder.Property(ir => ir.ResponseHeadersJson)
            .HasColumnType("nvarchar(max)");

        builder.Property(ir => ir.ResourceLocation)
            .HasMaxLength(500);

        builder.Property(ir => ir.CreatedAt)
            .IsRequired();

        builder.Property(ir => ir.ExpiresAt)
            .IsRequired();

        builder.HasIndex(ir => ir.IdempotencyKey)
            .IsUnique();

        builder.HasIndex(ir => ir.ExpiresAt);
    }
}

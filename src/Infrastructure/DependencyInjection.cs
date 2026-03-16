using System.Text;
using HotelBookingPlatform.Application.AuditLogs.Queries;
using HotelBookingPlatform.Application.Bookings.Jobs;
using HotelBookingPlatform.Application.Bookings.Queries;
using HotelBookingPlatform.Application.Common.Interfaces;
using HotelBookingPlatform.Application.Hotels.Queries;
using HotelBookingPlatform.Domain.Enums;
using HotelBookingPlatform.Infrastructure.Auditing;
using HotelBookingPlatform.Infrastructure.Authentication;
using HotelBookingPlatform.Infrastructure.Bookings;
using HotelBookingPlatform.Infrastructure.Caching;
using HotelBookingPlatform.Infrastructure.Data;
using HotelBookingPlatform.Infrastructure.Data.Interceptors;
using HotelBookingPlatform.Infrastructure.Hotels;
using HotelBookingPlatform.Infrastructure.Idempotency;
using HotelBookingPlatform.Infrastructure.Querying;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Microsoft.IdentityModel.Tokens;

namespace Microsoft.Extensions.DependencyInjection;

public static class DependencyInjection
{
    public static void AddInfrastructureServices(this IHostApplicationBuilder builder)
    {
        var connectionString = builder.Configuration.GetConnectionString("HotelBookingPlatformDb");
        Guard.Against.Null(connectionString, message: "Connection string 'HotelBookingPlatformDb' not found.");

        builder.Services.AddHttpContextAccessor();
        builder.Services.AddMemoryCache();
        builder.Services.AddScoped<ISaveChangesInterceptor, AuditableEntityInterceptor>();
        builder.Services.AddScoped<ISaveChangesInterceptor, DispatchDomainEventsInterceptor>();

        builder.Services.AddDbContext<ApplicationDbContext>((sp, options) =>
        {
            options.AddInterceptors(sp.GetServices<ISaveChangesInterceptor>());
            options.UseSqlServer(connectionString);
            options.ConfigureWarnings(warnings => warnings.Ignore(RelationalEventId.PendingModelChangesWarning));
        });

        builder.Services.AddScoped<IApplicationDbContext>(provider => provider.GetRequiredService<ApplicationDbContext>());
        builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
        builder.Services.AddScoped<IAuditLogService, AuditLogService>();
        builder.Services.Configure<AvailabilityCacheOptions>(
            builder.Configuration.GetSection(AvailabilityCacheOptions.SectionName));
        builder.Services.AddSingleton<IAvailabilityCache, AvailabilityCache>();
        builder.Services.AddScoped<ApplicationDbContextInitialiser>();

        builder.Services.AddSingleton<IDbConnectionFactory>(_ => new SqlConnectionFactory(connectionString));
        builder.Services.Configure<BookingExpirationOptions>(
            builder.Configuration.GetSection(BookingExpirationOptions.SectionName));
        builder.Services.AddScoped<IAuditLogQueryService, AuditLogQueryService>();
        builder.Services.AddScoped<IHotelQueryService, HotelQueryService>();
        builder.Services.AddScoped<IBookingQueryService, BookingQueryService>();
        builder.Services.AddScoped<IBookingExpirationService, BookingExpirationService>();
        builder.Services.AddScoped<IIdempotencyService, IdempotencyService>();
        builder.Services.AddScoped<IPasswordHasher, AspNetPasswordHasher>();
        builder.Services.AddScoped<ITokenService, JwtTokenService>();
        builder.Services.AddScoped<ICurrentUserService, CurrentUserService>();

        builder.Services.AddSingleton(TimeProvider.System);

        var jwtSection = builder.Configuration.GetSection(JwtOptions.SectionName);
        builder.Services.Configure<JwtOptions>(jwtSection);

        var jwtOptions = jwtSection.Get<JwtOptions>() ?? new JwtOptions();
        Guard.Against.NullOrWhiteSpace(jwtOptions.SigningKey, message: "JWT signing key is not configured.");
        if (jwtOptions.SigningKey.Length < 32)
            throw new InvalidOperationException("JWT signing key must be at least 32 characters (256 bits) for HMAC-SHA256.");

        var key = Encoding.UTF8.GetBytes(jwtOptions.SigningKey);

        builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateIssuerSigningKey = true,
                    ValidateLifetime = true,
                    ValidIssuer = jwtOptions.Issuer,
                    ValidAudience = jwtOptions.Audience,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ClockSkew = TimeSpan.FromSeconds(30)
                };
            });

        builder.Services.AddAuthorizationBuilder()
            .AddPolicy("AdminOnly", policy => policy.RequireRole(UserRole.Admin.ToString()));
    }
}

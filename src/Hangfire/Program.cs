using Hangfire;
using Hangfire.Dashboard;
using Hangfire.SqlServer;
using HotelBookingPlatform.Hangfire;
using HotelBookingPlatform.Infrastructure.Data;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

builder.Host.UseSerilog((ctx, config) =>
    config.ReadFrom.Configuration(ctx.Configuration));

builder.AddApplicationServices();
builder.AddInfrastructureServices();

var connectionString = builder.Configuration.GetConnectionString("HotelBookingPlatformDb")
    ?? throw new InvalidOperationException("Connection string 'HotelBookingPlatformDb' not found.");

builder.Services.AddHangfire(configuration => configuration
    .SetDataCompatibilityLevel(CompatibilityLevel.Version_180)
    .UseSimpleAssemblyNameTypeSerializer()
    .UseRecommendedSerializerSettings()
    .UseSqlServerStorage(connectionString, new SqlServerStorageOptions
    {
        PrepareSchemaIfNecessary = true,
        QueuePollInterval = TimeSpan.FromSeconds(15),
        SlidingInvisibilityTimeout = TimeSpan.FromMinutes(5),
        UseRecommendedIsolationLevel = true,
        DisableGlobalLocks = true
    }));

builder.Services.AddHangfireServer(options =>
{
    options.ServerName = $"{Environment.MachineName}:booking-expiration";
    options.Queues = ["default"];
});

builder.Services.AddHostedService<BookingExpirationRecurringJobSetupService>();

var app = builder.Build();
var allowRemoteDashboardAccess = app.Configuration.GetValue("Hangfire:AllowRemoteDashboardAccess", app.Environment.IsDevelopment());

if (app.Environment.IsDevelopment())
{
    using var scope = app.Services.CreateScope();
    var initialiser = scope.ServiceProvider.GetRequiredService<ApplicationDbContextInitialiser>();
    await initialiser.InitialiseAsync();
    await initialiser.SeedAsync();
}

app.UseSerilogRequestLogging();
app.UseHangfireDashboard("/hangfire", new DashboardOptions
{
    Authorization = [new DashboardAccessFilter(allowRemoteDashboardAccess)]
});

app.MapGet("/", () => Results.Redirect("/hangfire"));
app.MapGet("/health", () => Results.Ok(new { status = "ok" }));

app.Run();

public partial class Program;

sealed class DashboardAccessFilter(bool allowRemoteAccess) : IDashboardAuthorizationFilter
{
    public bool Authorize(DashboardContext context)
    {
        if (allowRemoteAccess)
        {
            return true;
        }

        var httpContext = context.GetHttpContext();
        var remote = httpContext.Connection.RemoteIpAddress;
        return remote is not null && (
            System.Net.IPAddress.IsLoopback(remote) ||
            remote.Equals(httpContext.Connection.LocalIpAddress));
    }
}

using Microsoft.Extensions.Configuration;

namespace HotelBookingPlatform.Infrastructure.IntegrationTests;

/// <summary>
/// Runs once per test assembly: creates the LocalDB schema on first run,
/// drops and recreates it so every run starts clean.
/// </summary>
[SetUpFixture]
public class IntegrationTestSetup
{
    public static string ConnectionString { get; private set; } = null!;

    [OneTimeSetUp]
    public async Task OneTimeSetUp()
    {
        var config = new ConfigurationBuilder()
            .AddJsonFile("appsettings.json", optional: false)
            .AddEnvironmentVariables()
            .Build();

        ConnectionString = config.GetConnectionString("HotelBookingPlatformDb")
            ?? throw new InvalidOperationException("Connection string not configured.");

        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseSqlServer(ConnectionString)
            .Options;

        await using var context = new ApplicationDbContext(options);
        await context.Database.EnsureDeletedAsync();
        await context.Database.EnsureCreatedAsync();
    }
}

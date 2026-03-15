namespace HotelBookingPlatform.Infrastructure.IntegrationTests;

/// <summary>
/// Base class for all integration tests.
/// Opens a connection before each test and uses Respawn to wipe all rows after each test,
/// keeping the schema intact so tests always start with an empty database.
/// </summary>
[TestFixture]
public abstract class IntegrationTestBase
{
    private SqlConnection _connection = null!;
    private Respawner _respawner = null!;

    [SetUp]
    public async Task BaseSetUp()
    {
        _connection = new SqlConnection(IntegrationTestSetup.ConnectionString);
        await _connection.OpenAsync();

        _respawner = await Respawner.CreateAsync(_connection, new RespawnerOptions
        {
            TablesToIgnore = ["__EFMigrationsHistory"]
        });
    }

    [TearDown]
    public async Task BaseTearDown()
    {
        await _respawner.ResetAsync(_connection);
        await _connection.DisposeAsync();
    }

    // ── DI scope factory ─────────────────────────────────────────────────────

    /// <summary>
    /// Creates a DI scope with Infrastructure services wired up.
    /// Optionally impersonates an authenticated user for the interceptor.
    /// </summary>
    protected IServiceScope CreateScope(int? userId = null, string? userEmail = null)
    {
        var services = new ServiceCollection();

        services.AddSingleton(TimeProvider.System);
        services.AddSingleton<ICurrentUserService>(
            new FakeCurrentUserService(userId, userEmail));

        services.AddScoped<ISaveChangesInterceptor, Data.Interceptors.AuditableEntityInterceptor>();

        services.AddDbContext<ApplicationDbContext>((sp, options) =>
        {
            options.AddInterceptors(sp.GetServices<ISaveChangesInterceptor>());
            options.UseSqlServer(IntegrationTestSetup.ConnectionString);
        });

        services.AddScoped<IApplicationDbContext>(
            p => p.GetRequiredService<ApplicationDbContext>());
        services.AddScoped<IUnitOfWork, HotelBookingPlatform.Infrastructure.Data.UnitOfWork>();
        services.AddScoped<IAuditLogService, HotelBookingPlatform.Infrastructure.Auditing.AuditLogService>();

        return services.BuildServiceProvider().CreateScope();
    }

    // ── Convenience helpers ───────────────────────────────────────────────────

    protected static Hotel MakeHotel(string name = "Test Hotel") => new()
    {
        Name = name,
        Description = "Integration test hotel",
        Address = "123 Test St",
        City = "San Salvador",
        Country = "El Salvador",
        Email = "test@hotel.com",
        PhoneNumber = "+50312345678",
        StarRating = 3,
        IsActive = true
    };
}

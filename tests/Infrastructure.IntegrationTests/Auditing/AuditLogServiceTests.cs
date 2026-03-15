using HotelBookingPlatform.Application.Common.Models;

namespace HotelBookingPlatform.Infrastructure.IntegrationTests.Auditing;

[TestFixture]
public class AuditLogServiceTests : IntegrationTestBase
{
    // ── Add + SaveChanges persists ────────────────────────────────────────────

    [Test]
    public async Task Add_ThenSaveChanges_PersistsAuditLog()
    {
        using var scope = CreateScope(userId: 1, userEmail: "admin@hotel.com");
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var uow = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();
        var auditLog = scope.ServiceProvider.GetRequiredService<IAuditLogService>();

        auditLog.Add(new AuditLogEntry("Hotel", 42, "HotelCreated",
            NewValues: """{"Name":"Test"}"""));
        await uow.SaveChangesAsync();

        var saved = await context.AuditLogs.FirstOrDefaultAsync(
            a => a.EntityName == "Hotel" && a.EntityId == 42);
        saved.ShouldNotBeNull();
        saved.Action.ShouldBe("HotelCreated");
        saved.NewValues.ShouldBe("""{"Name":"Test"}""");
    }

    [Test]
    public async Task Add_WithoutSaveChanges_DoesNotPersist()
    {
        using var scope = CreateScope(userId: 1);
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var auditLog = scope.ServiceProvider.GetRequiredService<IAuditLogService>();

        // Add to change tracker but never save
        auditLog.Add(new AuditLogEntry("Hotel", 99, "NeverSaved"));

        // Verify via a fresh independent context
        using var verifyScope = CreateScope();
        var verifyContext = verifyScope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var exists = await verifyContext.AuditLogs.AnyAsync(
            a => a.EntityName == "Hotel" && a.EntityId == 99);
        exists.ShouldBeFalse();
    }

    // ── Current user resolution ───────────────────────────────────────────────

    [Test]
    public async Task Add_UsesCurrentUserEmailAsUserName()
    {
        using var scope = CreateScope(userId: 5, userEmail: "staff@hotel.com");
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var uow = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();
        var auditLog = scope.ServiceProvider.GetRequiredService<IAuditLogService>();

        auditLog.Add(new AuditLogEntry("Booking", 10, "BookingConfirmed"));
        await uow.SaveChangesAsync();

        var saved = await context.AuditLogs.FirstOrDefaultAsync(
            a => a.EntityName == "Booking" && a.EntityId == 10);
        saved.ShouldNotBeNull();
        saved.UserId.ShouldBe("5");
        saved.UserName.ShouldBe("staff@hotel.com");
    }

    [Test]
    public async Task Add_UnauthenticatedUser_LeavesUserFieldsNull()
    {
        using var scope = CreateScope(userId: null);
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var uow = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();
        var auditLog = scope.ServiceProvider.GetRequiredService<IAuditLogService>();

        auditLog.Add(new AuditLogEntry("System", 0, "SystemAction"));
        await uow.SaveChangesAsync();

        var saved = await context.AuditLogs.FirstOrDefaultAsync(
            a => a.EntityName == "System" && a.Action == "SystemAction");
        saved.ShouldNotBeNull();
        saved.UserId.ShouldBeNull();
        saved.UserName.ShouldBeNull();
    }

    [Test]
    public async Task Add_ExplicitActorOverridesCurrentUser()
    {
        using var scope = CreateScope(userId: 1, userEmail: "current@hotel.com");
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var uow = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();
        var auditLog = scope.ServiceProvider.GetRequiredService<IAuditLogService>();

        auditLog.Add(new AuditLogEntry("Booking", 20, "AdminOverride",
            ActorUserId: "admin-99", ActorUserName: "superadmin@hotel.com"));
        await uow.SaveChangesAsync();

        var saved = await context.AuditLogs.FirstOrDefaultAsync(
            a => a.EntityName == "Booking" && a.EntityId == 20);
        saved.ShouldNotBeNull();
        saved.UserId.ShouldBe("admin-99");
        saved.UserName.ShouldBe("superadmin@hotel.com");
    }

    // ── Atomic with entity changes ────────────────────────────────────────────

    [Test]
    public async Task Add_SavedAtomicallyWithEntityChange_InSingleTransaction()
    {
        using var scope = CreateScope(userId: 1, userEmail: "admin@hotel.com");
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var uow = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();
        var auditLog = scope.ServiceProvider.GetRequiredService<IAuditLogService>();

        // Add entity + audit log in same save
        var hotel = MakeHotel("Audited Hotel");
        context.Hotels.Add(hotel);
        await uow.SaveChangesAsync();  // saves hotel, gets hotel.Id

        auditLog.Add(new AuditLogEntry("Hotel", hotel.Id, "HotelCreated"));
        await uow.SaveChangesAsync();  // saves audit log

        var hotelExists = await context.Hotels.AnyAsync(h => h.Name == "Audited Hotel");
        var logExists = await context.AuditLogs.AnyAsync(
            a => a.EntityName == "Hotel" && a.EntityId == hotel.Id);

        hotelExists.ShouldBeTrue();
        logExists.ShouldBeTrue();
    }

    [Test]
    public async Task Add_MultipleEntries_AllPersisted()
    {
        using var scope = CreateScope(userId: 1);
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var uow = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();
        var auditLog = scope.ServiceProvider.GetRequiredService<IAuditLogService>();

        auditLog.Add(new AuditLogEntry("Hotel", 1, "Created"));
        auditLog.Add(new AuditLogEntry("Hotel", 1, "Updated"));
        auditLog.Add(new AuditLogEntry("Hotel", 1, "Deleted"));
        await uow.SaveChangesAsync();

        var count = await context.AuditLogs.CountAsync(
            a => a.EntityName == "Hotel" && a.EntityId == 1);
        count.ShouldBe(3);
    }
}

namespace HotelBookingPlatform.Infrastructure.IntegrationTests.Interceptors;

[TestFixture]
public class AuditableEntityInterceptorTests : IntegrationTestBase
{
    // ── Created / CreatedBy ───────────────────────────────────────────────────

    [Test]
    public async Task SaveChanges_NewEntity_SetsCreatedTimestamp()
    {
        var before = DateTimeOffset.UtcNow;

        using var scope = CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var uow = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

        var hotel = MakeHotel();
        context.Hotels.Add(hotel);
        await uow.SaveChangesAsync();

        hotel.Created.ShouldBeGreaterThanOrEqualTo(before);
    }

    [Test]
    public async Task SaveChanges_NewEntity_SetsLastModifiedTimestamp()
    {
        var before = DateTimeOffset.UtcNow;

        using var scope = CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var uow = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

        var hotel = MakeHotel();
        context.Hotels.Add(hotel);
        await uow.SaveChangesAsync();

        hotel.LastModified.ShouldBeGreaterThanOrEqualTo(before);
    }

    [Test]
    public async Task SaveChanges_Unauthenticated_SetsCreatedByToSystem()
    {
        // No userId supplied → FakeCurrentUserService.IsAuthenticated == false
        using var scope = CreateScope(userId: null);
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var uow = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

        var hotel = MakeHotel();
        context.Hotels.Add(hotel);
        await uow.SaveChangesAsync();

        hotel.CreatedBy.ShouldBe("system");
    }

    [Test]
    public async Task SaveChanges_AuthenticatedWithEmail_SetsCreatedByToEmail()
    {
        using var scope = CreateScope(userId: 1, userEmail: "admin@hotel.com");
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var uow = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

        var hotel = MakeHotel();
        context.Hotels.Add(hotel);
        await uow.SaveChangesAsync();

        hotel.CreatedBy.ShouldBe("admin@hotel.com");
    }

    [Test]
    public async Task SaveChanges_AuthenticatedWithoutEmail_SetsCreatedByToUserId()
    {
        using var scope = CreateScope(userId: 7, userEmail: null);
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var uow = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

        var hotel = MakeHotel();
        context.Hotels.Add(hotel);
        await uow.SaveChangesAsync();

        hotel.CreatedBy.ShouldBe("7");
    }

    // ── LastModified / LastModifiedBy on update ───────────────────────────────

    [Test]
    public async Task SaveChanges_UpdateEntity_UpdatesLastModifiedButNotCreated()
    {
        // Insert
        using var insertScope = CreateScope();
        var insertContext = insertScope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var insertUow = insertScope.ServiceProvider.GetRequiredService<IUnitOfWork>();

        var hotel = MakeHotel("Update Test");
        insertContext.Hotels.Add(hotel);
        await insertUow.SaveChangesAsync();

        var createdAt = hotel.Created;

        // Small delay so timestamps are distinguishable
        await Task.Delay(10);
        var beforeUpdate = DateTimeOffset.UtcNow;

        // Update in a new scope
        using var updateScope = CreateScope(userId: 2, userEmail: "editor@hotel.com");
        var updateContext = updateScope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var updateUow = updateScope.ServiceProvider.GetRequiredService<IUnitOfWork>();

        var toUpdate = await updateContext.Hotels.FindAsync(hotel.Id);
        toUpdate!.Name = "Updated Name";
        await updateUow.SaveChangesAsync();

        toUpdate.Created.ShouldBe(createdAt);
        toUpdate.LastModified.ShouldBeGreaterThanOrEqualTo(beforeUpdate);
        toUpdate.LastModifiedBy.ShouldBe("editor@hotel.com");
    }
}

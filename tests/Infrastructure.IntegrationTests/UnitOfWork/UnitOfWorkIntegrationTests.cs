namespace HotelBookingPlatform.Infrastructure.IntegrationTests.UnitOfWork;

[TestFixture]
public class UnitOfWorkIntegrationTests : IntegrationTestBase
{
    // ── Commit persists data ──────────────────────────────────────────────────

    [Test]
    public async Task SaveChangesAsync_WithoutTransaction_PersistsData()
    {
        using var scope = CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var uow = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

        context.Hotels.Add(MakeHotel("Persist Test"));
        await uow.SaveChangesAsync();

        var saved = await context.Hotels.FirstOrDefaultAsync(h => h.Name == "Persist Test");
        saved.ShouldNotBeNull();
    }

    [Test]
    public async Task CommitAsync_PersistsAllSavesWithinTransaction()
    {
        using var scope = CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var uow = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

        await uow.BeginTransactionAsync();

        context.Hotels.Add(MakeHotel("Hotel A"));
        await uow.SaveChangesAsync();

        context.Hotels.Add(MakeHotel("Hotel B"));
        await uow.SaveChangesAsync();

        await uow.CommitAsync();

        // Verify both persisted using a fresh context
        using var verifyScope = CreateScope();
        var verifyContext = verifyScope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var count = await verifyContext.Hotels.CountAsync(
            h => h.Name == "Hotel A" || h.Name == "Hotel B");
        count.ShouldBe(2);
    }

    // ── Rollback discards data ────────────────────────────────────────────────

    [Test]
    public async Task RollbackAsync_DiscardsAllSavesWithinTransaction()
    {
        using var scope = CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var uow = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

        await uow.BeginTransactionAsync();

        context.Hotels.Add(MakeHotel("Should Be Gone"));
        await uow.SaveChangesAsync();

        await uow.RollbackAsync();

        // Verify nothing persisted using a fresh context
        using var verifyScope = CreateScope();
        var verifyContext = verifyScope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var exists = await verifyContext.Hotels.AnyAsync(h => h.Name == "Should Be Gone");
        exists.ShouldBeFalse();
    }

    [Test]
    public async Task RollbackAsync_AfterMultipleSaves_DiscardsAll()
    {
        using var scope = CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var uow = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

        await uow.BeginTransactionAsync();

        context.Hotels.Add(MakeHotel("Rollback A"));
        await uow.SaveChangesAsync();

        context.Hotels.Add(MakeHotel("Rollback B"));
        await uow.SaveChangesAsync();

        await uow.RollbackAsync();

        using var verifyScope = CreateScope();
        var verifyContext = verifyScope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var count = await verifyContext.Hotels.CountAsync(
            h => h.Name == "Rollback A" || h.Name == "Rollback B");
        count.ShouldBe(0);
    }

    // ── DisposeAsync auto-rollback ────────────────────────────────────────────

    [Test]
    public async Task DisposeAsync_WithUncommittedTransaction_RollsBack()
    {
        using var scope = CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var uow = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

        await uow.BeginTransactionAsync();

        context.Hotels.Add(MakeHotel("Auto Rollback"));
        await uow.SaveChangesAsync();

        // Dispose without commit — should auto-rollback
        await ((IAsyncDisposable)uow).DisposeAsync();

        using var verifyScope = CreateScope();
        var verifyContext = verifyScope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var exists = await verifyContext.Hotels.AnyAsync(h => h.Name == "Auto Rollback");
        exists.ShouldBeFalse();
    }

    // ── Isolation: two transactions don't see each other's uncommitted data ──

    [Test]
    public async Task Transaction_UncommittedData_NotVisibleToOtherConnections()
    {
        using var scope1 = CreateScope();
        var context1 = scope1.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var uow1 = scope1.ServiceProvider.GetRequiredService<IUnitOfWork>();

        await uow1.BeginTransactionAsync();
        context1.Hotels.Add(MakeHotel("Uncommitted"));
        await uow1.SaveChangesAsync();

        // Second independent connection should not see the uncommitted row
        using var scope2 = CreateScope();
        var context2 = scope2.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var visible = await context2.Hotels.AnyAsync(h => h.Name == "Uncommitted");
        visible.ShouldBeFalse();

        await uow1.RollbackAsync();
    }
}

using HotelBookingPlatform.Domain.Entities;
using HotelBookingPlatform.Infrastructure.Data;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using NUnit.Framework;
using Shouldly;

namespace HotelBookingPlatform.Application.UnitTests.Common.Infrastructure;

[TestFixture]
public class UnitOfWorkTests
{
    private SqliteConnection _connection = null!;
    private ApplicationDbContext _context = null!;
    private UnitOfWork _sut = null!;

    [SetUp]
    public void SetUp()
    {
        // Keep a persistent SQLite in-memory connection alive across the test
        // so the DB stays alive and real transactions are supported.
        _connection = new SqliteConnection("DataSource=:memory:");
        _connection.Open();

        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseSqlite(_connection)
            .Options;

        _context = new ApplicationDbContext(options);
        _sut = new UnitOfWork(_context);
    }

    [TearDown]
    public async Task TearDown()
    {
        await _sut.DisposeAsync();
        await _context.DisposeAsync();
        await _connection.DisposeAsync();
    }

    // --- initial state ---

    [Test]
    public void IsTransactionActive_Initially_ReturnsFalse()
    {
        _sut.IsTransactionActive.ShouldBeFalse();
    }

    // --- BeginTransactionAsync ---

    [Test]
    public async Task BeginTransactionAsync_SetsIsTransactionActiveTrue()
    {
        await _sut.BeginTransactionAsync();

        _sut.IsTransactionActive.ShouldBeTrue();
    }

    [Test]
    public async Task BeginTransactionAsync_WhenAlreadyActive_IsIdempotent()
    {
        await _sut.BeginTransactionAsync();
        await _sut.BeginTransactionAsync(); // second call must be a no-op

        _sut.IsTransactionActive.ShouldBeTrue();
    }

    // --- CommitAsync ---

    [Test]
    public async Task CommitAsync_WithoutActiveTransaction_ThrowsInvalidOperationException()
    {
        await Should.ThrowAsync<InvalidOperationException>(() => _sut.CommitAsync());
    }

    [Test]
    public async Task CommitAsync_WithActiveTransaction_SetsIsTransactionActiveFalse()
    {
        await _sut.BeginTransactionAsync();

        await _sut.CommitAsync();

        _sut.IsTransactionActive.ShouldBeFalse();
    }

    [Test]
    public async Task CommitAsync_AfterAlreadyCommitted_ThrowsInvalidOperationException()
    {
        await _sut.BeginTransactionAsync();
        await _sut.CommitAsync();

        await Should.ThrowAsync<InvalidOperationException>(() => _sut.CommitAsync());
    }

    // --- RollbackAsync ---

    [Test]
    public async Task RollbackAsync_WithoutActiveTransaction_DoesNotThrow()
    {
        await Should.NotThrowAsync(() => _sut.RollbackAsync());
    }

    [Test]
    public async Task RollbackAsync_WithActiveTransaction_SetsIsTransactionActiveFalse()
    {
        await _sut.BeginTransactionAsync();

        await _sut.RollbackAsync();

        _sut.IsTransactionActive.ShouldBeFalse();
    }

    [Test]
    public async Task RollbackAsync_ClearsTrackedEntities()
    {
        // Track an entity without saving
        var user = new User
        {
            Email = "test@example.com",
            NormalizedEmail = "TEST@EXAMPLE.COM",
            FirstName = "Test",
            LastName = "User",
            PasswordHash = "hash"
        };
        _context.Users.Add(user);
        _context.ChangeTracker.Entries().ShouldNotBeEmpty();

        await _sut.BeginTransactionAsync();
        await _sut.RollbackAsync();

        _context.ChangeTracker.Entries().ShouldBeEmpty();
    }

    // --- DisposeAsync ---

    [Test]
    public async Task DisposeAsync_WithActiveTransaction_SetsIsTransactionActiveFalse()
    {
        await _sut.BeginTransactionAsync();

        await _sut.DisposeAsync();

        _sut.IsTransactionActive.ShouldBeFalse();
    }

    [Test]
    public async Task DisposeAsync_WithoutActiveTransaction_DoesNotThrow()
    {
        await Should.NotThrowAsync(async () => await _sut.DisposeAsync());
    }
}

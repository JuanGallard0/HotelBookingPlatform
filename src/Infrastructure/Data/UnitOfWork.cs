using HotelBookingPlatform.Application.Common.Interfaces;
using Microsoft.EntityFrameworkCore.Storage;

namespace HotelBookingPlatform.Infrastructure.Data;

internal sealed class UnitOfWork(ApplicationDbContext context) : IUnitOfWork, IAsyncDisposable
{
    private IDbContextTransaction? _transaction;

    public bool IsTransactionActive => _transaction is not null;

    public async Task BeginTransactionAsync(CancellationToken cancellationToken = default)
    {
        if (_transaction is not null)
            return;

        _transaction = await context.Database.BeginTransactionAsync(cancellationToken);
    }

    public Task<int> SaveChangesAsync(CancellationToken cancellationToken = default) =>
        context.SaveChangesAsync(cancellationToken);

    public async Task CommitAsync(CancellationToken cancellationToken = default)
    {
        if (_transaction is null)
            throw new InvalidOperationException("No active transaction to commit.");

        try
        {
            await context.SaveChangesAsync(cancellationToken);
            await _transaction.CommitAsync(cancellationToken);
        }
        finally
        {
            await _transaction.DisposeAsync();
            _transaction = null;
        }
    }

    public async Task RollbackAsync(CancellationToken cancellationToken = default)
    {
        if (_transaction is null)
            return;

        try
        {
            await _transaction.RollbackAsync(cancellationToken);
        }
        finally
        {
            await _transaction.DisposeAsync();
            _transaction = null;
            context.ChangeTracker.Clear();
        }
    }

    public async ValueTask DisposeAsync()
    {
        if (_transaction is not null)
        {
            await _transaction.RollbackAsync();
            await _transaction.DisposeAsync();
            _transaction = null;
            context.ChangeTracker.Clear();
        }
    }
}

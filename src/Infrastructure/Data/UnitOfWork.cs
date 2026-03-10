using HotelBookingPlatform.Application.Common.Interfaces;
using Microsoft.EntityFrameworkCore.Storage;

namespace HotelBookingPlatform.Infrastructure.Data;

internal sealed class UnitOfWork(ApplicationDbContext context) : IUnitOfWork
{
    private IDbContextTransaction? _transaction;

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
            return;

        await _transaction.CommitAsync(cancellationToken);
        await _transaction.DisposeAsync();
        _transaction = null;
    }

    public async Task RollbackAsync(CancellationToken cancellationToken = default)
    {
        if (_transaction is null)
            return;

        await _transaction.RollbackAsync(cancellationToken);
        await _transaction.DisposeAsync();
        _transaction = null;
    }
}

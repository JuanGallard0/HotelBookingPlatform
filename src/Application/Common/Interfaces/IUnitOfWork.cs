namespace HotelBookingPlatform.Application.Common.Interfaces;

public interface IUnitOfWork
{
    bool IsTransactionActive { get; }
    Task BeginTransactionAsync(CancellationToken cancellationToken = default);
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    Task CommitAsync(CancellationToken cancellationToken = default);
    Task RollbackAsync(CancellationToken cancellationToken = default);
}

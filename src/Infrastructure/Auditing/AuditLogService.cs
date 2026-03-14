using HotelBookingPlatform.Application.Common.Interfaces;
using HotelBookingPlatform.Application.Common.Models;
using HotelBookingPlatform.Domain.Entities;

namespace HotelBookingPlatform.Infrastructure.Auditing;

internal sealed class AuditLogService(
    IApplicationDbContext context,
    ICurrentUserService currentUser) : IAuditLogService
{
    public void Add(AuditLogEntry entry)
    {
        context.AuditLogs.Add(AuditLog.Create(
            entry.EntityName,
            entry.EntityId,
            entry.Action,
            currentUser.UserId?.ToString(),
            currentUser.Email,
            entry.OldValues,
            entry.NewValues,
            entry.AdditionalInfo));
    }
}

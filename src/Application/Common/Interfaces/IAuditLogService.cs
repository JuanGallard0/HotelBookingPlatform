using HotelBookingPlatform.Application.Common.Models;

namespace HotelBookingPlatform.Application.Common.Interfaces;

public interface IAuditLogService
{
    void Add(AuditLogEntry entry);
}

using System.Data;

namespace HotelBookingPlatform.Application.Common.Interfaces;

public interface IDbConnectionFactory
{
    IDbConnection CreateConnection();
}

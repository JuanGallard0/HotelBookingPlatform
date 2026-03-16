using System.Data;
using HotelBookingPlatform.Application.Common.Interfaces;
using Microsoft.Data.SqlClient;

namespace HotelBookingPlatform.Infrastructure.Querying;

public sealed class SqlConnectionFactory(string connectionString) : IDbConnectionFactory
{
    public IDbConnection CreateConnection() => new SqlConnection(connectionString);
}

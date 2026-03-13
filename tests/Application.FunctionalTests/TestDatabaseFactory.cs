using DotNet.Testcontainers.Builders;

namespace HotelBookingPlatform.Application.FunctionalTests;

public static class TestDatabaseFactory
{
    public static async Task<ITestDatabase> CreateAsync()
    {
        try
        {
            var dockerDatabase = new SqlTestcontainersTestDatabase();
            await dockerDatabase.InitialiseAsync();
            return dockerDatabase;
        }
        catch (DockerUnavailableException)
        {
            var localDatabase = new SqlTestDatabase();
            await localDatabase.InitialiseAsync();
            return localDatabase;
        }
    }
}

namespace HotelBookingPlatform.Api.Infrastructure;

public abstract class EndpointGroupBase
{
    public virtual string? GroupName { get; }
    public virtual string Version => "v1";
    public abstract void Map(RouteGroupBuilder groupBuilder);
}

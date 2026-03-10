using HotelBookingPlatform.Application.Auth.Common;
using HotelBookingPlatform.Application.Common.Interfaces;
using HotelBookingPlatform.Application.Common.Models;

namespace HotelBookingPlatform.Application.Auth.Queries.GetCurrentUser;

public class GetCurrentUserQueryHandler(
    IApplicationDbContext context,
    ICurrentUserService currentUser)
    : IRequestHandler<GetCurrentUserQuery, Result<AuthenticatedUserDto>>
{
    public async Task<Result<AuthenticatedUserDto>> Handle(GetCurrentUserQuery request, CancellationToken cancellationToken)
    {
        if (!currentUser.IsAuthenticated || currentUser.UserId is null)
            return Result<AuthenticatedUserDto>.Unauthorized();

        var user = await context.Users
            .SingleOrDefaultAsync(x => x.Id == currentUser.UserId.Value, cancellationToken);

        if (user is null || !user.IsActive)
            return Result<AuthenticatedUserDto>.Unauthorized();

        return Result<AuthenticatedUserDto>.Success(user.ToDto());
    }
}

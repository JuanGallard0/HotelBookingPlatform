using HotelBookingPlatform.Application.Common.Interfaces;
using HotelBookingPlatform.Application.Common.Models;

namespace HotelBookingPlatform.Application.Auth.Commands.LogoutUser;

public class LogoutUserCommandHandler(
    IApplicationDbContext context,
    IUnitOfWork unitOfWork,
    ITokenService tokenService,
    TimeProvider timeProvider)
    : IRequestHandler<LogoutUserCommand, Result>
{
    public async Task<Result> Handle(LogoutUserCommand request, CancellationToken cancellationToken)
    {
        var tokenHash = tokenService.ComputeRefreshTokenHash(request.RefreshToken);

        var storedToken = await context.RefreshTokens
            .SingleOrDefaultAsync(x => x.TokenHash == tokenHash, cancellationToken);

        if (storedToken is null)
            return Result.Success();

        if (storedToken.RevokedAt is null)
            storedToken.RevokedAt = timeProvider.GetUtcNow();

        await unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}

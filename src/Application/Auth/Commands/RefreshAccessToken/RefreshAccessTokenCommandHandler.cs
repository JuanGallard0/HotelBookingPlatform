using HotelBookingPlatform.Application.Auth.Common;
using HotelBookingPlatform.Application.Common.Interfaces;
using HotelBookingPlatform.Application.Common.Models;
using HotelBookingPlatform.Domain.Entities;

namespace HotelBookingPlatform.Application.Auth.Commands.RefreshAccessToken;

public class RefreshAccessTokenCommandHandler(
    IApplicationDbContext context,
    IUnitOfWork unitOfWork,
    ITokenService tokenService,
    TimeProvider timeProvider)
    : IRequestHandler<RefreshAccessTokenCommand, Result<AuthResponseDto>>
{
    public async Task<Result<AuthResponseDto>> Handle(RefreshAccessTokenCommand request, CancellationToken cancellationToken)
    {
        var tokenHash = tokenService.ComputeRefreshTokenHash(request.RefreshToken);
        var now = timeProvider.GetUtcNow();

        var storedToken = await context.RefreshTokens
            .Include(x => x.User)
            .ThenInclude(x => x.RefreshTokens)
            .SingleOrDefaultAsync(x => x.TokenHash == tokenHash, cancellationToken);

        if (storedToken is null || storedToken.RevokedAt is not null || storedToken.ExpiresAt <= now || !storedToken.User.IsActive)
            return Result<AuthResponseDto>.Unauthorized();

        var nextRefreshToken = tokenService.CreateRefreshToken();
        storedToken.RevokedAt = now;
        storedToken.ReplacedByTokenHash = nextRefreshToken.TokenHash;

        storedToken.User.RefreshTokens.Add(new RefreshToken
        {
            TokenHash = nextRefreshToken.TokenHash,
            ExpiresAt = nextRefreshToken.ExpiresAt
        });

        var staleTokens = storedToken.User.RefreshTokens
            .Where(t => t != storedToken && (t.RevokedAt is not null || t.ExpiresAt <= now))
            .ToList();
        foreach (var stale in staleTokens)
            context.RefreshTokens.Remove(stale);

        await unitOfWork.SaveChangesAsync(cancellationToken);

        var accessToken = tokenService.CreateAccessToken(storedToken.User);
        return Result<AuthResponseDto>.Success(storedToken.User.ToAuthResponse(accessToken, nextRefreshToken));
    }
}

using HotelBookingPlatform.Application.Auth.Common;
using HotelBookingPlatform.Application.Common.Interfaces;
using HotelBookingPlatform.Application.Common.Models;
using HotelBookingPlatform.Domain.Entities;

namespace HotelBookingPlatform.Application.Auth.Commands.LoginUser;

public class LoginUserCommandHandler(
    IApplicationDbContext context,
    IUnitOfWork unitOfWork,
    IPasswordHasher passwordHasher,
    ITokenService tokenService)
    : IRequestHandler<LoginUserCommand, Result<AuthResponseDto>>
{
    public async Task<Result<AuthResponseDto>> Handle(LoginUserCommand request, CancellationToken cancellationToken)
    {
        var normalizedEmail = request.Email.Trim().ToUpperInvariant();

        var user = await context.Users
            .Include(x => x.RefreshTokens)
            .SingleOrDefaultAsync(x => x.NormalizedEmail == normalizedEmail, cancellationToken);

        if (user is null || !user.IsActive || !passwordHasher.VerifyPassword(user, request.Password, user.PasswordHash))
            return Result<AuthResponseDto>.Unauthorized();

        var refreshToken = tokenService.CreateRefreshToken();
        user.RefreshTokens.Add(new RefreshToken
        {
            TokenHash = refreshToken.TokenHash,
            ExpiresAt = refreshToken.ExpiresAt
        });

        await unitOfWork.SaveChangesAsync(cancellationToken);

        var accessToken = tokenService.CreateAccessToken(user);
        return Result<AuthResponseDto>.Success(user.ToAuthResponse(accessToken, refreshToken));
    }
}

using HotelBookingPlatform.Application.Auth.Common;
using HotelBookingPlatform.Application.Common.Interfaces;
using HotelBookingPlatform.Application.Common.Models;
using HotelBookingPlatform.Domain.Entities;
using HotelBookingPlatform.Domain.Enums;

namespace HotelBookingPlatform.Application.Auth.Commands.RegisterUser;

public class RegisterUserCommandHandler(
    IApplicationDbContext context,
    IUnitOfWork unitOfWork,
    IPasswordHasher passwordHasher,
    ITokenService tokenService)
    : IRequestHandler<RegisterUserCommand, Result<AuthResponseDto>>
{
    public async Task<Result<AuthResponseDto>> Handle(RegisterUserCommand request, CancellationToken cancellationToken)
    {
        var normalizedEmail = request.Email.Trim().ToUpperInvariant();

        var existingUser = await context.Users
            .AnyAsync(x => x.NormalizedEmail == normalizedEmail, cancellationToken);

        if (existingUser)
            return Result<AuthResponseDto>.Conflict("A user with that email already exists.");

        var user = new User
        {
            Email = request.Email.Trim(),
            NormalizedEmail = normalizedEmail,
            FirstName = request.FirstName.Trim(),
            LastName = request.LastName.Trim(),
            Role = UserRole.Customer,
            IsActive = true
        };

        user.PasswordHash = passwordHasher.HashPassword(user, request.Password);

        var refreshToken = tokenService.CreateRefreshToken();
        user.RefreshTokens.Add(new RefreshToken
        {
            TokenHash = refreshToken.TokenHash,
            ExpiresAt = refreshToken.ExpiresAt
        });

        context.Users.Add(user);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        var accessToken = tokenService.CreateAccessToken(user);
        return Result<AuthResponseDto>.Success(user.ToAuthResponse(accessToken, refreshToken));
    }
}

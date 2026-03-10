using HotelBookingPlatform.Application.Common.Interfaces;
using HotelBookingPlatform.Domain.Entities;
using Microsoft.AspNetCore.Identity;

namespace HotelBookingPlatform.Infrastructure.Authentication;

internal sealed class AspNetPasswordHasher : IPasswordHasher
{
    private readonly PasswordHasher<User> _passwordHasher = new();

    public string HashPassword(User user, string password) => _passwordHasher.HashPassword(user, password);

    public bool VerifyPassword(User user, string password, string passwordHash)
    {
        var result = _passwordHasher.VerifyHashedPassword(user, passwordHash, password);
        return result is PasswordVerificationResult.Success or PasswordVerificationResult.SuccessRehashNeeded;
    }
}

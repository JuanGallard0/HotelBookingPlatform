using HotelBookingPlatform.Application.Auth.Common;
using HotelBookingPlatform.Application.Common.Models;

namespace HotelBookingPlatform.Application.Auth.Queries.GetCurrentUser;

public record GetCurrentUserQuery : IRequest<Result<AuthenticatedUserDto>>;

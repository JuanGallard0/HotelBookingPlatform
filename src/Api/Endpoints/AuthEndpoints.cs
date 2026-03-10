using HotelBookingPlatform.Application.Auth.Commands.LoginUser;
using HotelBookingPlatform.Application.Auth.Commands.LogoutUser;
using HotelBookingPlatform.Application.Auth.Commands.RefreshAccessToken;
using HotelBookingPlatform.Application.Auth.Commands.RegisterUser;
using HotelBookingPlatform.Application.Auth.Common;
using HotelBookingPlatform.Application.Auth.Queries.GetCurrentUser;
using Microsoft.AspNetCore.Authorization;

namespace HotelBookingPlatform.Api.Endpoints;

public class AuthEndpoints : EndpointGroupBase
{
    public override string GroupName => "auth";

    public override void Map(RouteGroupBuilder group)
    {
        group.MapPost(Register, "register")
            .AllowAnonymous()
            .WithSummary("Register a customer account")
            .Produces<ApiResponse<AuthResponseDto>>(StatusCodes.Status200OK)
            .Produces<ApiResponse<object?>>(StatusCodes.Status400BadRequest)
            .Produces<ApiResponse<object?>>(StatusCodes.Status409Conflict);

        group.MapPost(Login, "login")
            .AllowAnonymous()
            .WithSummary("Authenticate a user and issue JWT tokens")
            .Produces<ApiResponse<AuthResponseDto>>(StatusCodes.Status200OK)
            .Produces<ApiResponse<object?>>(StatusCodes.Status400BadRequest)
            .Produces<ApiResponse<object?>>(StatusCodes.Status401Unauthorized);

        group.MapPost(Refresh, "refresh")
            .AllowAnonymous()
            .WithSummary("Rotate a refresh token and issue a new access token")
            .Produces<ApiResponse<AuthResponseDto>>(StatusCodes.Status200OK)
            .Produces<ApiResponse<object?>>(StatusCodes.Status400BadRequest)
            .Produces<ApiResponse<object?>>(StatusCodes.Status401Unauthorized);

        group.MapPost(Logout, "logout")
            .AllowAnonymous()
            .WithSummary("Revoke a refresh token")
            .Produces<ApiResponse<object?>>(StatusCodes.Status200OK)
            .Produces<ApiResponse<object?>>(StatusCodes.Status400BadRequest);

        group.MapGet(Me)
            .RequireAuthorization()
            .WithSummary("Get the current authenticated user")
            .Produces<ApiResponse<AuthenticatedUserDto>>(StatusCodes.Status200OK)
            .Produces<ApiResponse<object?>>(StatusCodes.Status401Unauthorized);
    }

    private static async Task<IResult> Register(
        RegisterUserCommand command,
        ISender sender,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(command, cancellationToken);
        return result.ToHttpResult();
    }

    private static async Task<IResult> Login(
        LoginUserCommand command,
        ISender sender,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(command, cancellationToken);
        return result.ToHttpResult();
    }

    private static async Task<IResult> Refresh(
        RefreshAccessTokenCommand command,
        ISender sender,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(command, cancellationToken);
        return result.ToHttpResult();
    }

    private static async Task<IResult> Logout(
        LogoutUserCommand command,
        ISender sender,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(command, cancellationToken);
        return result.ToHttpResult();
    }

    [Authorize]
    private static async Task<IResult> Me(
        ISender sender,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(new GetCurrentUserQuery(), cancellationToken);
        return result.ToHttpResult();
    }
}

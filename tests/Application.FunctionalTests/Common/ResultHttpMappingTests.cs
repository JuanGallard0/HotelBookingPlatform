using System.Text.Json;
using HotelBookingPlatform.Api.Infrastructure;
using HotelBookingPlatform.Application.Common.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using NUnit.Framework;
using Shouldly;

namespace HotelBookingPlatform.Application.FunctionalTests.Common;

[TestFixture]
public class ResultHttpMappingTests
{
    [TestCase(ResultErrorType.None, StatusCodes.Status200OK)]
    [TestCase(ResultErrorType.NotFound, StatusCodes.Status404NotFound)]
    [TestCase(ResultErrorType.Conflict, StatusCodes.Status409Conflict)]
    [TestCase(ResultErrorType.UnprocessableEntity, StatusCodes.Status422UnprocessableEntity)]
    [TestCase(ResultErrorType.Unauthorized, StatusCodes.Status401Unauthorized)]
    [TestCase(ResultErrorType.Forbidden, StatusCodes.Status403Forbidden)]
    [TestCase(ResultErrorType.Validation, StatusCodes.Status400BadRequest)]
    public async Task ToHttpResult_ShouldMapExpectedStatusCodes(ResultErrorType errorType, int expectedStatusCode)
    {
        var result = CreateResult(errorType);

        var httpResponse = await ExecuteAsync(result.ToHttpResult());
        var payload = JsonSerializer.Deserialize<ApiResponse<object?>>(
            httpResponse.Body,
            new JsonSerializerOptions(JsonSerializerDefaults.Web));

        httpResponse.StatusCode.ShouldBe(expectedStatusCode);
        payload.ShouldNotBeNull();
        payload.Success.ShouldBe(errorType == ResultErrorType.None);
    }

    [Test]
    public async Task ToCreatedHttpResult_WhenSuccessful_ShouldReturnCreatedWithPayloadAndLocation()
    {
        var result = Result<string>.Success("created-booking");

        var httpResponse = await ExecuteAsync(result.ToCreatedHttpResult("/api/v1/bookings/BKG-123"));
        var payload = JsonSerializer.Deserialize<ApiResponse<string>>(
            httpResponse.Body,
            new JsonSerializerOptions(JsonSerializerDefaults.Web));

        httpResponse.StatusCode.ShouldBe(StatusCodes.Status201Created);
        httpResponse.Headers["Location"].ShouldBe("/api/v1/bookings/BKG-123");
        payload.ShouldNotBeNull();
        payload.Success.ShouldBeTrue();
        payload.Data.ShouldBe("created-booking");
    }

    private static Result CreateResult(ResultErrorType errorType) => errorType switch
    {
        ResultErrorType.None => Result.Success(),
        ResultErrorType.NotFound => Result.NotFound("missing"),
        ResultErrorType.Conflict => Result.Conflict("conflict"),
        ResultErrorType.UnprocessableEntity => Result.UnprocessableEntity("unprocessable"),
        ResultErrorType.Unauthorized => Result.Unauthorized(),
        ResultErrorType.Forbidden => Result.Forbidden(),
        ResultErrorType.Validation => Result.Failure("validation"),
        _ => throw new ArgumentOutOfRangeException(nameof(errorType), errorType, null)
    };

    private static async Task<CapturedResponse> ExecuteAsync(IResult result)
    {
        var httpContext = new DefaultHttpContext();
        httpContext.Response.Body = new MemoryStream();
        httpContext.RequestServices = new ServiceCollection()
            .AddLogging()
            .AddProblemDetails()
            .BuildServiceProvider();

        await result.ExecuteAsync(httpContext);

        httpContext.Response.Body.Position = 0;
        using var reader = new StreamReader(httpContext.Response.Body, leaveOpen: true);
        var body = await reader.ReadToEndAsync();

        return new CapturedResponse(
            httpContext.Response.StatusCode,
            body,
            httpContext.Response.Headers.ToDictionary(
                pair => pair.Key,
                pair => pair.Value.ToString()));
    }

    private sealed record CapturedResponse(
        int StatusCode,
        string Body,
        IReadOnlyDictionary<string, string> Headers);
}

using HotelBookingPlatform.Application.Common.Models;
using NUnit.Framework;
using Shouldly;

namespace HotelBookingPlatform.Application.UnitTests.Common.Models;

[TestFixture]
public class ResultTests
{
    [Test]
    public void Success_ShouldCreateSuccessfulResultWithoutErrors()
    {
        var result = Result.Success();

        result.Succeeded.ShouldBeTrue();
        result.Errors.ShouldBeEmpty();
        result.ErrorType.ShouldBe(ResultErrorType.None);
        result.ErrorCode.ShouldBeNull();
    }

    [Test]
    public void Failure_ShouldCreateFailedResultWithErrors()
    {
        var result = Result.Failure(["first", "second"]);

        result.Succeeded.ShouldBeFalse();
        result.Errors.ShouldBe(["first", "second"]);
        result.ErrorType.ShouldBe(ResultErrorType.Validation);
        result.ErrorCode.ShouldBe("VALIDATION_ERROR");
    }

    [TestCase(ResultErrorType.NotFound, "NOT_FOUND")]
    [TestCase(ResultErrorType.Conflict, "CONFLICT")]
    [TestCase(ResultErrorType.UnprocessableEntity, "UNPROCESSABLE_ENTITY")]
    [TestCase(ResultErrorType.Unauthorized, "UNAUTHORIZED")]
    [TestCase(ResultErrorType.Forbidden, "FORBIDDEN")]
    public void ErrorFactories_ShouldSetExpectedTypeAndErrorCode(ResultErrorType expectedType, string expectedCode)
    {
        var result = expectedType switch
        {
            ResultErrorType.NotFound => Result.NotFound("missing"),
            ResultErrorType.Conflict => Result.Conflict("conflict"),
            ResultErrorType.UnprocessableEntity => Result.UnprocessableEntity("unprocessable"),
            ResultErrorType.Unauthorized => Result.Unauthorized(),
            ResultErrorType.Forbidden => Result.Forbidden(),
            _ => throw new ArgumentOutOfRangeException(nameof(expectedType), expectedType, null)
        };

        result.Succeeded.ShouldBeFalse();
        result.ErrorType.ShouldBe(expectedType);
        result.ErrorCode.ShouldBe(expectedCode);
        result.Errors.ShouldNotBeEmpty();
    }

    [Test]
    public void GenericSuccess_ShouldPreserveValue()
    {
        var result = Result<string>.Success("booking-created");

        result.Succeeded.ShouldBeTrue();
        result.Value.ShouldBe("booking-created");
        result.Errors.ShouldBeEmpty();
        result.ErrorType.ShouldBe(ResultErrorType.None);
    }

    [Test]
    public void GenericFailure_ShouldExposeValidationMetadata()
    {
        var result = Result<string>.Failure("invalid");

        result.Succeeded.ShouldBeFalse();
        result.Value.ShouldBeNull();
        result.Errors.ShouldBe(["invalid"]);
        result.ErrorType.ShouldBe(ResultErrorType.Validation);
        result.ErrorCode.ShouldBe("VALIDATION_ERROR");
    }

    [Test]
    public void GenericConflict_ShouldClearValueAndExposeConflictMetadata()
    {
        var result = Result<string>.Conflict("duplicate");

        result.Succeeded.ShouldBeFalse();
        result.Value.ShouldBeNull();
        result.Errors.ShouldBe(["duplicate"]);
        result.ErrorType.ShouldBe(ResultErrorType.Conflict);
        result.ErrorCode.ShouldBe("CONFLICT");
    }
}

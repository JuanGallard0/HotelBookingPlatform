using HotelBookingPlatform.Application.Common.Behaviours;
using HotelBookingPlatform.Application.Common.Interfaces;
using HotelBookingPlatform.Application.Common.Models;
using HotelBookingPlatform.Application.UnitTests.Fakes.Commands.Fake;
using MediatR;
using Moq;
using NUnit.Framework;
using Shouldly;

namespace HotelBookingPlatform.Application.UnitTests.Common.Behaviours
{
    [TestFixture]
    public class TransactionBehaviourTests
    {
        private Mock<IUnitOfWork> _unitOfWork = null!;

        [SetUp]
        public void SetUp()
        {
            _unitOfWork = new Mock<IUnitOfWork>();
            _unitOfWork.Setup(u => u.IsTransactionActive).Returns(false);
        }

        // --- namespace routing ---

        [Test]
        public async Task Handle_QueryNamespace_DoesNotBeginTransaction()
        {
            var behaviour = new TransactionBehaviour<FakeQuery, Result>(_unitOfWork.Object);

            await behaviour.Handle(new FakeQuery(), _ => Task.FromResult(Result.Success()), CancellationToken.None);

            _unitOfWork.Verify(u => u.BeginTransactionAsync(It.IsAny<CancellationToken>()), Times.Never);
            _unitOfWork.Verify(u => u.CommitAsync(It.IsAny<CancellationToken>()), Times.Never);
        }

        [Test]
        public async Task Handle_QueryNamespace_ReturnsHandlerResponse()
        {
            var behaviour = new TransactionBehaviour<FakeQuery, Result>(_unitOfWork.Object);
            var expected = Result.Success();

            var actual = await behaviour.Handle(new FakeQuery(), _ => Task.FromResult(expected), CancellationToken.None);

            actual.ShouldBe(expected);
        }

        [Test]
        public async Task Handle_Command_WhenTransactionAlreadyActive_SkipsBeginAndCommit()
        {
            _unitOfWork.Setup(u => u.IsTransactionActive).Returns(true);
            var behaviour = new TransactionBehaviour<FakeCommand, Result>(_unitOfWork.Object);

            await behaviour.Handle(new FakeCommand(), _ => Task.FromResult(Result.Success()), CancellationToken.None);

            _unitOfWork.Verify(u => u.BeginTransactionAsync(It.IsAny<CancellationToken>()), Times.Never);
            _unitOfWork.Verify(u => u.CommitAsync(It.IsAny<CancellationToken>()), Times.Never);
        }

        // --- commit path ---

        [Test]
        public async Task Handle_Command_SuccessResult_BeginsAndCommits()
        {
            var behaviour = new TransactionBehaviour<FakeCommand, Result>(_unitOfWork.Object);

            await behaviour.Handle(new FakeCommand(), _ => Task.FromResult(Result.Success()), CancellationToken.None);

            _unitOfWork.Verify(u => u.BeginTransactionAsync(It.IsAny<CancellationToken>()), Times.Once);
            _unitOfWork.Verify(u => u.CommitAsync(It.IsAny<CancellationToken>()), Times.Once);
            _unitOfWork.Verify(u => u.RollbackAsync(It.IsAny<CancellationToken>()), Times.Never);
        }

        [Test]
        public async Task Handle_Command_SuccessResult_ReturnsHandlerResponse()
        {
            var behaviour = new TransactionBehaviour<FakeCommand, Result>(_unitOfWork.Object);
            var expected = Result.Success();

            var actual = await behaviour.Handle(new FakeCommand(), _ => Task.FromResult(expected), CancellationToken.None);

            actual.ShouldBe(expected);
        }

        [Test]
        public async Task Handle_Command_ResultT_Success_BeginsAndCommits()
        {
            var behaviour = new TransactionBehaviour<FakeCommand, Result<string>>(_unitOfWork.Object);

            await behaviour.Handle(new FakeCommand(), _ => Task.FromResult(Result<string>.Success("ok")), CancellationToken.None);

            _unitOfWork.Verify(u => u.BeginTransactionAsync(It.IsAny<CancellationToken>()), Times.Once);
            _unitOfWork.Verify(u => u.CommitAsync(It.IsAny<CancellationToken>()), Times.Once);
            _unitOfWork.Verify(u => u.RollbackAsync(It.IsAny<CancellationToken>()), Times.Never);
        }

        // --- rollback path ---

        [Test]
        public async Task Handle_Command_FailedResult_BeginsAndRollsBack()
        {
            var behaviour = new TransactionBehaviour<FakeCommand, Result>(_unitOfWork.Object);

            await behaviour.Handle(new FakeCommand(), _ => Task.FromResult(Result.NotFound("not found")), CancellationToken.None);

            _unitOfWork.Verify(u => u.BeginTransactionAsync(It.IsAny<CancellationToken>()), Times.Once);
            _unitOfWork.Verify(u => u.RollbackAsync(It.IsAny<CancellationToken>()), Times.Once);
            _unitOfWork.Verify(u => u.CommitAsync(It.IsAny<CancellationToken>()), Times.Never);
        }

        [Test]
        public async Task Handle_Command_FailedResult_ReturnsHandlerResponse()
        {
            var behaviour = new TransactionBehaviour<FakeCommand, Result>(_unitOfWork.Object);
            var expected = Result.NotFound("not found");

            var actual = await behaviour.Handle(new FakeCommand(), _ => Task.FromResult(expected), CancellationToken.None);

            actual.Succeeded.ShouldBeFalse();
            actual.ErrorType.ShouldBe(ResultErrorType.NotFound);
        }

        [Test]
        public async Task Handle_Command_ResultT_Failure_BeginsAndRollsBack()
        {
            var behaviour = new TransactionBehaviour<FakeCommand, Result<string>>(_unitOfWork.Object);

            await behaviour.Handle(new FakeCommand(), _ => Task.FromResult(Result<string>.NotFound("not found")), CancellationToken.None);

            _unitOfWork.Verify(u => u.BeginTransactionAsync(It.IsAny<CancellationToken>()), Times.Once);
            _unitOfWork.Verify(u => u.RollbackAsync(It.IsAny<CancellationToken>()), Times.Once);
            _unitOfWork.Verify(u => u.CommitAsync(It.IsAny<CancellationToken>()), Times.Never);
        }

        [Test]
        public async Task Handle_Command_ThrowsException_BeginsAndRollsBackAndRethrows()
        {
            var behaviour = new TransactionBehaviour<FakeCommand, Result>(_unitOfWork.Object);

            await Should.ThrowAsync<InvalidOperationException>(() =>
                behaviour.Handle(new FakeCommand(), _ => throw new InvalidOperationException("boom"), CancellationToken.None));

            _unitOfWork.Verify(u => u.BeginTransactionAsync(It.IsAny<CancellationToken>()), Times.Once);
            _unitOfWork.Verify(u => u.RollbackAsync(It.IsAny<CancellationToken>()), Times.Once);
            _unitOfWork.Verify(u => u.CommitAsync(It.IsAny<CancellationToken>()), Times.Never);
        }

        // --- all failed result types trigger rollback ---

        [TestCase("Conflict")]
        [TestCase("Unauthorized")]
        [TestCase("Forbidden")]
        [TestCase("UnprocessableEntity")]
        public async Task Handle_Command_AnyFailedResultType_RollsBack(string errorType)
        {
            var behaviour = new TransactionBehaviour<FakeCommand, Result>(_unitOfWork.Object);
            var result = errorType switch
            {
                "Conflict"             => Result.Conflict("c"),
                "Unauthorized"         => Result.Unauthorized(),
                "Forbidden"            => Result.Forbidden(),
                "UnprocessableEntity"  => Result.UnprocessableEntity("u"),
                _                      => throw new ArgumentOutOfRangeException()
            };

            await behaviour.Handle(new FakeCommand(), _ => Task.FromResult(result), CancellationToken.None);

            _unitOfWork.Verify(u => u.RollbackAsync(It.IsAny<CancellationToken>()), Times.Once);
            _unitOfWork.Verify(u => u.CommitAsync(It.IsAny<CancellationToken>()), Times.Never);
        }
    }

    // Not in a .Commands. namespace → no transaction wrapping
    public record FakeQuery : IRequest<Result>;
}

// In a .Commands. namespace → transaction wrapping
namespace HotelBookingPlatform.Application.UnitTests.Fakes.Commands.Fake
{
    using HotelBookingPlatform.Application.Common.Models;
    using MediatR;

    public record FakeCommand : IRequest<Result>;
}

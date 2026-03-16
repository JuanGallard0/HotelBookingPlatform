using HotelBookingPlatform.Domain.Entities;
using HotelBookingPlatform.Domain.Enums;
using NUnit.Framework;
using Shouldly;

namespace HotelBookingPlatform.Application.UnitTests.Domain;

[TestFixture]
public class PaymentTests
{
    private static Payment Create(PaymentStatus status = PaymentStatus.Pending) => new()
    {
        BookingId = 1,
        TransactionId = "TXN-001",
        Amount = 250m,
        Currency = "USD",
        PaymentMethod = PaymentMethod.CreditCard,
        Status = status
    };

    // --- MarkAsAuthorized ---

    [Test]
    public void MarkAsAuthorized_PendingPayment_SetsAuthorizedStatus()
    {
        var payment = Create(PaymentStatus.Pending);

        payment.MarkAsAuthorized();

        payment.Status.ShouldBe(PaymentStatus.Authorized);
    }

    [Test]
    public void MarkAsAuthorized_PendingPayment_SetsProcessedAt()
    {
        var before = DateTimeOffset.UtcNow;
        var payment = Create(PaymentStatus.Pending);

        payment.MarkAsAuthorized();

        payment.ProcessedAt.ShouldNotBeNull();
        payment.ProcessedAt.Value.ShouldBeGreaterThanOrEqualTo(before);
    }

    [TestCase(PaymentStatus.Authorized)]
    [TestCase(PaymentStatus.Captured)]
    [TestCase(PaymentStatus.Failed)]
    [TestCase(PaymentStatus.Refunded)]
    public void MarkAsAuthorized_NonPendingStatus_ThrowsInvalidOperationException(PaymentStatus status)
    {
        var payment = Create(status);

        Should.Throw<InvalidOperationException>(() => payment.MarkAsAuthorized());
    }

    // --- MarkAsCaptured ---

    [Test]
    public void MarkAsCaptured_AuthorizedPayment_SetsCapturedStatus()
    {
        var payment = Create(PaymentStatus.Authorized);

        payment.MarkAsCaptured();

        payment.Status.ShouldBe(PaymentStatus.Captured);
    }

    [Test]
    public void MarkAsCaptured_AuthorizedPayment_SetsProcessedAt()
    {
        var before = DateTimeOffset.UtcNow;
        var payment = Create(PaymentStatus.Authorized);

        payment.MarkAsCaptured();

        payment.ProcessedAt.ShouldNotBeNull();
        payment.ProcessedAt.Value.ShouldBeGreaterThanOrEqualTo(before);
    }

    [TestCase(PaymentStatus.Pending)]
    [TestCase(PaymentStatus.Captured)]
    [TestCase(PaymentStatus.Failed)]
    [TestCase(PaymentStatus.Refunded)]
    public void MarkAsCaptured_NonAuthorizedStatus_ThrowsInvalidOperationException(PaymentStatus status)
    {
        var payment = Create(status);

        Should.Throw<InvalidOperationException>(() => payment.MarkAsCaptured());
    }

    // --- MarkAsFailed ---

    [TestCase(PaymentStatus.Pending)]
    [TestCase(PaymentStatus.Authorized)]
    [TestCase(PaymentStatus.Captured)]
    public void MarkAsFailed_AnyStatus_SetsFailedStatus(PaymentStatus status)
    {
        var payment = Create(status);

        payment.MarkAsFailed("Card declined");

        payment.Status.ShouldBe(PaymentStatus.Failed);
    }

    [Test]
    public void MarkAsFailed_SetsFailureReason()
    {
        var payment = Create();

        payment.MarkAsFailed("Insufficient funds");

        payment.FailureReason.ShouldBe("Insufficient funds");
    }

    [Test]
    public void MarkAsFailed_SetsProcessedAt()
    {
        var before = DateTimeOffset.UtcNow;
        var payment = Create();

        payment.MarkAsFailed("error");

        payment.ProcessedAt.ShouldNotBeNull();
        payment.ProcessedAt.Value.ShouldBeGreaterThanOrEqualTo(before);
    }

    // --- MarkAsRefunded ---

    [Test]
    public void MarkAsRefunded_CapturedPayment_SetsRefundedStatus()
    {
        var payment = Create(PaymentStatus.Captured);

        payment.MarkAsRefunded();

        payment.Status.ShouldBe(PaymentStatus.Refunded);
    }

    [TestCase(PaymentStatus.Pending)]
    [TestCase(PaymentStatus.Authorized)]
    [TestCase(PaymentStatus.Failed)]
    [TestCase(PaymentStatus.Refunded)]
    public void MarkAsRefunded_NonCapturedStatus_ThrowsInvalidOperationException(PaymentStatus status)
    {
        var payment = Create(status);

        Should.Throw<InvalidOperationException>(() => payment.MarkAsRefunded());
    }

    // --- Full state machine ---

    [Test]
    public void FullAuthorizeCaptureFlow_TransitionsCorrectly()
    {
        var payment = Create(PaymentStatus.Pending);

        payment.MarkAsAuthorized();
        payment.Status.ShouldBe(PaymentStatus.Authorized);

        payment.MarkAsCaptured();
        payment.Status.ShouldBe(PaymentStatus.Captured);

        payment.MarkAsRefunded();
        payment.Status.ShouldBe(PaymentStatus.Refunded);
    }
}

namespace HotelBookingPlatform.Domain.Entities;

public class Payment : BaseAuditableEntity
{
    public int BookingId { get; set; }
    public string TransactionId { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "USD";
    public PaymentMethod PaymentMethod { get; set; }
    public PaymentStatus Status { get; set; }
    public DateTimeOffset? ProcessedAt { get; set; }
    public string? FailureReason { get; set; }

    public Booking Booking { get; set; } = null!;

    public void MarkAsAuthorized()
    {
        if (Status != PaymentStatus.Pending)
        {
            throw new InvalidOperationException($"Cannot authorize payment with status {Status}.");
        }

        Status = PaymentStatus.Authorized;
        ProcessedAt = DateTimeOffset.UtcNow;
    }

    public void MarkAsCaptured()
    {
        if (Status != PaymentStatus.Authorized)
        {
            throw new InvalidOperationException($"Cannot capture payment with status {Status}.");
        }

        Status = PaymentStatus.Captured;
        ProcessedAt = DateTimeOffset.UtcNow;
    }

    public void MarkAsFailed(string reason)
    {
        Status = PaymentStatus.Failed;
        FailureReason = reason;
        ProcessedAt = DateTimeOffset.UtcNow;
    }

    public void MarkAsRefunded()
    {
        if (Status != PaymentStatus.Captured)
        {
            throw new InvalidOperationException($"Cannot refund payment with status {Status}.");
        }

        Status = PaymentStatus.Refunded;
    }
}

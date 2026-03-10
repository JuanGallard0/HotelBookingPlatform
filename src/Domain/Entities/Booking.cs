using HotelBookingPlatform.Domain.Events;
using HotelBookingPlatform.Domain.Exceptions;

namespace HotelBookingPlatform.Domain.Entities;

public class Booking : BaseAuditableEntity
{
    public const int MaximumNightsAllowed = 30;

    public string BookingNumber { get; set; } = string.Empty;
    public int UserId { get; set; }
    public int GuestId { get; set; }
    public int RoomTypeId { get; set; }
    public DateOnly CheckInDate { get; set; }
    public DateOnly CheckOutDate { get; set; }
    public int NumberOfGuests { get; set; }
    public int NumberOfRooms { get; set; }
    public decimal TotalAmount { get; set; }
    public BookingStatus Status { get; set; }
    public string? SpecialRequests { get; set; }
    public DateTimeOffset? ConfirmedAt { get; set; }
    public DateTimeOffset? CancelledAt { get; set; }
    public string? CancellationReason { get; set; }
    public byte[] RowVersion { get; set; } = Array.Empty<byte>();

    public User User { get; set; } = null!;
    public Guest Guest { get; set; } = null!;
    public RoomType RoomType { get; set; } = null!;
    public ICollection<Payment> Payments { get; set; } = new List<Payment>();

    public int NumberOfNights => CheckOutDate.DayNumber - CheckInDate.DayNumber;

    public void ValidateBookingDates()
    {
        if (CheckOutDate <= CheckInDate)
        {
            throw new InvalidBookingDatesException("Check-out date must be after check-in date.");
        }

        if (NumberOfNights > MaximumNightsAllowed)
        {
            throw new InvalidBookingDatesException($"Maximum booking duration is {MaximumNightsAllowed} nights.");
        }

        if (CheckInDate < DateOnly.FromDateTime(DateTime.UtcNow))
        {
            throw new InvalidBookingDatesException("Check-in date cannot be in the past.");
        }
    }

    public void Confirm()
    {
        if (Status != BookingStatus.Pending)
        {
            throw new BookingStatusException("confirm", Status.ToString());
        }

        Status = BookingStatus.Confirmed;
        ConfirmedAt = DateTimeOffset.UtcNow;

        AddDomainEvent(new BookingConfirmedEvent(this));
    }

    public void Cancel(string reason)
    {
        if (Status == BookingStatus.Cancelled)
        {
            throw new BookingStatusException("Booking is already cancelled.");
        }

        if (Status == BookingStatus.CheckedOut)
        {
            throw new BookingStatusException("cancel", Status.ToString());
        }

        Status = BookingStatus.Cancelled;
        CancelledAt = DateTimeOffset.UtcNow;
        CancellationReason = reason;

        AddDomainEvent(new BookingCancelledEvent(this));
    }

    public static Booking Create(
        string bookingNumber,
        int userId,
        int guestId,
        int roomTypeId,
        DateOnly checkInDate,
        DateOnly checkOutDate,
        int numberOfGuests,
        int numberOfRooms,
        decimal totalAmount,
        string? specialRequests = null)
    {
        var booking = new Booking
        {
            BookingNumber = bookingNumber,
            UserId = userId,
            GuestId = guestId,
            RoomTypeId = roomTypeId,
            CheckInDate = checkInDate,
            CheckOutDate = checkOutDate,
            NumberOfGuests = numberOfGuests,
            NumberOfRooms = numberOfRooms,
            TotalAmount = totalAmount,
            Status = BookingStatus.Pending,
            SpecialRequests = specialRequests
        };

        booking.ValidateBookingDates();
        booking.AddDomainEvent(new BookingCreatedEvent(booking));

        return booking;
    }
}

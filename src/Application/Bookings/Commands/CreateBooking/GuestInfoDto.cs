namespace HotelBookingPlatform.Application.Bookings.Commands.CreateBooking;

public record GuestInfoDto(
    string FirstName,
    string LastName,
    string Email,
    string PhoneNumber,
    string? DocumentType = null,
    string? DocumentNumber = null,
    DateOnly? DateOfBirth = null,
    string? Nationality = null);

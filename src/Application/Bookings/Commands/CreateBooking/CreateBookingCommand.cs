using HotelBookingPlatform.Application.Common.Extensions;
using HotelBookingPlatform.Application.Common.Interfaces;
using HotelBookingPlatform.Application.Common.Models;
using HotelBookingPlatform.Domain.Entities;
using System.Diagnostics;
using System.Text.Json;

namespace HotelBookingPlatform.Application.Bookings.Commands.CreateBooking;

public record CreateBookingCommand : IRequest<Result<BookingDto>>
{
    public int RoomTypeId { get; init; }
    public DateOnly CheckIn { get; init; }
    public DateOnly CheckOut { get; init; }
    public int NumberOfGuests { get; init; }
    public int NumberOfRooms { get; init; }
    public GuestInfoDto Guest { get; init; } = null!;
    public string? SpecialRequests { get; init; }
}

public class CreateBookingCommandHandler(
    IApplicationDbContext context,
    IUnitOfWork unitOfWork,
    IAuditLogService auditLogService,
    ICurrentUserService currentUser,
    TimeProvider timeProvider)
    : IRequestHandler<CreateBookingCommand, Result<BookingDto>>
{
    public async Task<Result<BookingDto>> Handle(
        CreateBookingCommand request,
        CancellationToken cancellationToken)
    {
        if (!currentUser.IsAuthenticated || !currentUser.UserId.HasValue)
            return Result<BookingDto>.Unauthorized();

        var roomType = await context.RoomTypes
            .Include(rt => rt.Hotel)
            .FirstOrDefaultAsync(
                rt => rt.Id == request.RoomTypeId && rt.IsActive && rt.Hotel.IsActive,
                cancellationToken);

        if (roomType is null)
            return Result<BookingDto>.NotFound(
                $"Room type with id {request.RoomTypeId} was not found.");

        if (request.NumberOfGuests > roomType.MaxOccupancy * request.NumberOfRooms)
            return Result<BookingDto>.UnprocessableEntity(
                $"Room type supports a maximum of {roomType.MaxOccupancy} guests per room " +
                $"({roomType.MaxOccupancy * request.NumberOfRooms} total for {request.NumberOfRooms} room(s)).");

        var checkIn = request.CheckIn;
        var checkOut = request.CheckOut;
        var nights = checkOut.DayNumber - checkIn.DayNumber;

        var inventories = await context.RoomInventories
            .Where(ri => ri.RoomTypeId == request.RoomTypeId
                      && ri.Date >= checkIn
                      && ri.Date < checkOut)
            .ToListAsync(cancellationToken);

        if (inventories.Count != nights)
            return Result<BookingDto>.UnprocessableEntity(
                "Room inventory is not fully available for the selected dates.");

        if (inventories.Any(ri => !ri.HasAvailability(request.NumberOfRooms)))
            return Result<BookingDto>.UnprocessableEntity(
                "Not enough rooms available for the selected dates.");

        var ratePlan = await context.RatePlans
            .Where(rp => rp.RoomTypeId == request.RoomTypeId
                      && rp.IsActive
                      && rp.ValidFrom <= checkIn
                      && rp.ValidTo >= checkOut)
            .OrderBy(rp => rp.PricePerNight)
            .FirstOrDefaultAsync(cancellationToken);

        var pricePerNight = ratePlan?.GetEffectivePrice() ?? roomType.BasePrice;
        var totalAmount = pricePerNight * nights * request.NumberOfRooms;

        try
        {
            var guest = await context.Guests
                .FirstOrDefaultAsync(
                    g => g.Email == request.Guest.Email.ToLower().Trim(),
                    cancellationToken);

            if (guest is null)
            {
                guest = CreateGuest(request.Guest);
                context.Guests.Add(guest);
                await unitOfWork.SaveChangesAsync(cancellationToken);
            }

            foreach (var inventory in inventories)
                inventory.ReserveRooms(request.NumberOfRooms);

            var booking = Booking.Create(
                GenerateBookingNumber(),
                currentUser.UserId.Value,
                guest.Id,
                request.RoomTypeId,
                checkIn,
                checkOut,
                request.NumberOfGuests,
                request.NumberOfRooms,
                totalAmount,
                timeProvider.GetElSalvadorDate(),
                request.SpecialRequests);

            context.Bookings.Add(booking);
            await unitOfWork.SaveChangesAsync(cancellationToken);

            auditLogService.Add(new AuditLogEntry(
                nameof(Booking),
                booking.Id,
                "BookingCreated",
                NewValues: Serialize(new
                {
                    booking.BookingNumber,
                    booking.Status,
                    booking.RoomTypeId,
                    booking.CheckInDate,
                    booking.CheckOutDate,
                    booking.NumberOfGuests,
                    booking.NumberOfRooms,
                    booking.TotalAmount,
                    booking.SpecialRequests
                }),
                AdditionalInfo: Serialize(new
                {
                    GuestId = booking.GuestId,
                    TraceId = Activity.Current?.TraceId.ToString(),
                    currentUser.Email
                })));

            var dto = MapToDto(booking, roomType.Name);
            return Result<BookingDto>.Success(dto);
        }
        catch (DbUpdateConcurrencyException)
        {
            return Result<BookingDto>.Conflict(
                "Rooms are no longer available for the selected dates. Please try again.");
        }
    }

    private static BookingDto MapToDto(Booking booking, string roomTypeName) => new()
    {
        BookingId = booking.Id,
        BookingNumber = booking.BookingNumber,
        RoomTypeName = roomTypeName,
        Status = booking.Status,
        CheckIn = booking.CheckInDate,
        CheckOut = booking.CheckOutDate,
        Nights = booking.NumberOfNights,
        NumberOfRooms = booking.NumberOfRooms,
        NumberOfGuests = booking.NumberOfGuests,
        TotalAmount = booking.TotalAmount,
        SpecialRequests = booking.SpecialRequests,
    };

    private static Guest CreateGuest(GuestInfoDto info) => new()
    {
        FirstName = info.FirstName.Trim(),
        LastName = info.LastName.Trim(),
        Email = info.Email.ToLower().Trim(),
        PhoneNumber = info.PhoneNumber.Trim(),
        DocumentType = info.DocumentType?.Trim(),
        DocumentNumber = info.DocumentNumber?.Trim(),
        DateOfBirth = info.DateOfBirth,
        Nationality = info.Nationality?.Trim(),
    };

    private string GenerateBookingNumber()
    {
        var date = timeProvider.GetUtcNow();
        var random = Guid.NewGuid().ToString("N").ToUpperInvariant()[..8];
        return $"BKG-{date:yyyyMMdd}-{random}";
    }

    private static string Serialize(object value) => JsonSerializer.Serialize(value);
}

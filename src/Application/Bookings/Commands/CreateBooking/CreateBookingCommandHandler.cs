using System.Text.Json;
using HotelBookingPlatform.Application.Common.Interfaces;
using HotelBookingPlatform.Application.Common.Models;
using HotelBookingPlatform.Domain.Entities;

namespace HotelBookingPlatform.Application.Bookings.Commands.CreateBooking;

public class CreateBookingCommandHandler(
    IApplicationDbContext context,
    IUnitOfWork unitOfWork,
    ICurrentUserService currentUser,
    IIdempotencyService idempotencyService,
    TimeProvider timeProvider)
    : IRequestHandler<CreateBookingCommand, Result<BookingDto>>
{
    public async Task<Result<BookingDto>> Handle(
        CreateBookingCommand request,
        CancellationToken cancellationToken)
    {
        if (!currentUser.IsAuthenticated || !currentUser.UserId.HasValue)
            return Result<BookingDto>.Unauthorized();

        // 1. Idempotency check
        if (!string.IsNullOrEmpty(request.IdempotencyKey))
        {
            var cached = await idempotencyService.GetCachedResponseAsync(
                request.IdempotencyKey, cancellationToken);

            if (cached is not null)
                return Result<BookingDto>.Success(
                    JsonSerializer.Deserialize<BookingDto>(cached)!);
        }

        // 2. Validate room type exists and is active
        var roomType = await context.RoomTypes
            .Include(rt => rt.Hotel)
            .FirstOrDefaultAsync(
                rt => rt.Id == request.RoomTypeId && rt.IsActive && rt.Hotel.IsActive,
                cancellationToken);

        if (roomType is null)
            return Result<BookingDto>.NotFound(
                $"Room type with id {request.RoomTypeId} was not found.");

        // 3. Validate guest capacity
        if (request.NumberOfGuests > roomType.MaxOccupancy * request.NumberOfRooms)
            return Result<BookingDto>.UnprocessableEntity(
                $"Room type supports a maximum of {roomType.MaxOccupancy} guests per room " +
                $"({roomType.MaxOccupancy * request.NumberOfRooms} total for {request.NumberOfRooms} room(s)).");

        // 4. Load and validate inventory for the full date range
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

        // 5. Resolve best active rate plan; fall back to room type base price
        var ratePlan = await context.RatePlans
            .Where(rp => rp.RoomTypeId == request.RoomTypeId
                      && rp.IsActive
                      && rp.ValidFrom <= checkIn
                      && rp.ValidTo >= checkOut)
            .OrderBy(rp => rp.PricePerNight)
            .FirstOrDefaultAsync(cancellationToken);

        var pricePerNight = ratePlan?.GetEffectivePrice() ?? roomType.BasePrice;
        var totalAmount = pricePerNight * nights * request.NumberOfRooms;

        // 6. Execute within a transaction for atomicity; RowVersion on RoomInventory
        //    handles optimistic concurrency against parallel bookings
        await unitOfWork.BeginTransactionAsync(cancellationToken);
        try
        {
            // Resolve existing guest by email or create a new one
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

            // Reserve inventory — throws InsufficientInventoryException if a concurrent
            // request already took the last room; DbUpdateConcurrencyException is caught below
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
                request.SpecialRequests);

            context.Bookings.Add(booking);
            await unitOfWork.SaveChangesAsync(cancellationToken);

            var dto = MapToDto(booking, roomType.Name);

            if (!string.IsNullOrEmpty(request.IdempotencyKey))
                await idempotencyService.StoreAsync(
                    request.IdempotencyKey,
                    "/api/v1/bookings",
                    201,
                    JsonSerializer.Serialize(dto),
                    cancellationToken);

            await unitOfWork.CommitAsync(cancellationToken);
            return Result<BookingDto>.Success(dto);
        }
        catch (DbUpdateConcurrencyException)
        {
            await unitOfWork.RollbackAsync(cancellationToken);
            return Result<BookingDto>.Conflict(
                "Rooms are no longer available for the selected dates. Please try again.");
        }
        catch
        {
            await unitOfWork.RollbackAsync(cancellationToken);
            throw;
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
}

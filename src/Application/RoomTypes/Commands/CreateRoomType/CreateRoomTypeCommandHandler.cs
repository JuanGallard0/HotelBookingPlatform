using HotelBookingPlatform.Application.Common.Interfaces;
using HotelBookingPlatform.Application.Common.Models;
using HotelBookingPlatform.Domain.Entities;

namespace HotelBookingPlatform.Application.RoomTypes.Commands.CreateRoomType;

public class CreateRoomTypeCommandHandler(
    IApplicationDbContext context,
    IUnitOfWork unitOfWork)
    : IRequestHandler<CreateRoomTypeCommand, Result<int>>
{
    public async Task<Result<int>> Handle(CreateRoomTypeCommand request, CancellationToken cancellationToken)
    {
        var hotelExists = await context.Hotels
            .AnyAsync(h => h.Id == request.HotelId, cancellationToken);

        if (!hotelExists)
            return Result<int>.NotFound($"Hotel with id {request.HotelId} was not found.");

        var roomType = new RoomType
        {
            HotelId     = request.HotelId,
            Name        = request.Name.Trim(),
            Description = request.Description.Trim(),
            MaxOccupancy = request.MaxOccupancy,
            BasePrice   = request.BasePrice,
            IsActive    = true
        };

        context.RoomTypes.Add(roomType);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<int>.Success(roomType.Id);
    }
}

using System.Text.Json.Serialization;
using HotelBookingPlatform.Application.Common.Interfaces;
using HotelBookingPlatform.Application.Common.Models;
using HotelBookingPlatform.Domain.Entities;

namespace HotelBookingPlatform.Application.Hotels.Commands.CreateRatePlan;

public record CreateRatePlanCommand(
    string Name,
    string Description,
    DateOnly ValidFrom,
    DateOnly ValidTo,
    decimal PricePerNight,
    decimal? DiscountPercentage,
    bool IsActive) : IRequest<Result<int>>
{
    [JsonIgnore]
    public int RoomTypeId { get; init; }
}

public class CreateRatePlanCommandHandler(
    IApplicationDbContext context,
    IUnitOfWork unitOfWork)
    : IRequestHandler<CreateRatePlanCommand, Result<int>>
{
    public async Task<Result<int>> Handle(CreateRatePlanCommand request, CancellationToken cancellationToken)
    {
        var roomTypeExists = await context.RoomTypes
            .AnyAsync(rt => rt.Id == request.RoomTypeId, cancellationToken);

        if (!roomTypeExists)
            return Result<int>.NotFound($"Room type with id {request.RoomTypeId} was not found.");

        var ratePlan = new RatePlan
        {
            RoomTypeId = request.RoomTypeId,
            Name = request.Name.Trim(),
            Description = request.Description.Trim(),
            ValidFrom = request.ValidFrom,
            ValidTo = request.ValidTo,
            PricePerNight = request.PricePerNight,
            DiscountPercentage = request.DiscountPercentage,
            IsActive = request.IsActive
        };

        context.RatePlans.Add(ratePlan);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<int>.Success(ratePlan.Id);
    }
}

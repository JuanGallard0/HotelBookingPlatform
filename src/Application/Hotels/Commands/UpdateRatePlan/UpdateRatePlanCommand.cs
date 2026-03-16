using System.Text.Json.Serialization;
using HotelBookingPlatform.Application.Common.Interfaces;
using HotelBookingPlatform.Application.Common.Models;

namespace HotelBookingPlatform.Application.Hotels.Commands.UpdateRatePlan;

public record UpdateRatePlanCommand(
    string Name,
    string Description,
    DateOnly ValidFrom,
    DateOnly ValidTo,
    decimal PricePerNight,
    decimal? DiscountPercentage,
    bool IsActive) : IRequest<Result>
{
    [JsonIgnore]
    public int RatePlanId { get; init; }
}

public class UpdateRatePlanCommandHandler(
    IApplicationDbContext context,
    IUnitOfWork unitOfWork)
    : IRequestHandler<UpdateRatePlanCommand, Result>
{
    public async Task<Result> Handle(UpdateRatePlanCommand request, CancellationToken cancellationToken)
    {
        var ratePlan = await context.RatePlans
            .FirstOrDefaultAsync(rp => rp.Id == request.RatePlanId, cancellationToken);

        if (ratePlan is null)
            return Result.NotFound($"Rate plan with id {request.RatePlanId} was not found.");

        ratePlan.Name = request.Name.Trim();
        ratePlan.Description = request.Description.Trim();
        ratePlan.ValidFrom = request.ValidFrom;
        ratePlan.ValidTo = request.ValidTo;
        ratePlan.PricePerNight = request.PricePerNight;
        ratePlan.DiscountPercentage = request.DiscountPercentage;
        ratePlan.IsActive = request.IsActive;

        await unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}

using HotelBookingPlatform.Application.Common.Interfaces;
using HotelBookingPlatform.Application.Common.Models;

namespace HotelBookingPlatform.Application.Hotels.Commands.DeleteRatePlan;

public record DeleteRatePlanCommand(int RatePlanId) : IRequest<Result>;

public class DeleteRatePlanCommandHandler(
    IApplicationDbContext context,
    IUnitOfWork unitOfWork)
    : IRequestHandler<DeleteRatePlanCommand, Result>
{
    public async Task<Result> Handle(DeleteRatePlanCommand request, CancellationToken cancellationToken)
    {
        var ratePlan = await context.RatePlans
            .FirstOrDefaultAsync(rp => rp.Id == request.RatePlanId, cancellationToken);

        if (ratePlan is null)
            return Result.NotFound($"Rate plan with id {request.RatePlanId} was not found.");

        context.RatePlans.Remove(ratePlan);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}

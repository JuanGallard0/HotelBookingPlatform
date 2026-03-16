using HotelBookingPlatform.Application.Common.Interfaces;
using HotelBookingPlatform.Application.Common.Models;

namespace HotelBookingPlatform.Application.Hotels.Queries.GetHotelById;

public record GetHotelByIdQuery(int Id) : IRequest<Result<HotelDto>>;

public class GetHotelByIdQueryHandler(IApplicationDbContext context)
    : IRequestHandler<GetHotelByIdQuery, Result<HotelDto>>
{
    public async Task<Result<HotelDto>> Handle(GetHotelByIdQuery request, CancellationToken cancellationToken)
    {
        var hotel = await context.Hotels
            .Where(h => h.Id == request.Id)
            .Select(h => new HotelDto
            {
                HotelId = h.Id,
                Name = h.Name,
                Description = h.Description,
                Address = h.Address,
                City = h.City,
                Country = h.Country,
                Email = h.Email,
                PhoneNumber = h.PhoneNumber,
                StarRating = h.StarRating,
                IsActive = h.IsActive,
            })
            .FirstOrDefaultAsync(cancellationToken);

        if (hotel is null)
            return Result<HotelDto>.NotFound($"Hotel with id {request.Id} was not found.");

        return Result<HotelDto>.Success(hotel);
    }
}

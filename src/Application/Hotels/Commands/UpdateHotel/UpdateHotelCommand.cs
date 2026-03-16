using System.Text.Json.Serialization;
using HotelBookingPlatform.Application.Common.Interfaces;
using HotelBookingPlatform.Application.Common.Models;

namespace HotelBookingPlatform.Application.Hotels.Commands.UpdateHotel;

public record UpdateHotelCommand(
    string Name,
    string Description,
    string Address,
    string City,
    string Country,
    string Email,
    string PhoneNumber,
    int StarRating,
    bool IsActive) : IRequest<Result>
{
    [JsonIgnore]
    public int Id { get; init; }
}

public class UpdateHotelCommandHandler(
    IApplicationDbContext context,
    IUnitOfWork unitOfWork)
    : IRequestHandler<UpdateHotelCommand, Result>
{
    public async Task<Result> Handle(UpdateHotelCommand request, CancellationToken cancellationToken)
    {
        var hotel = await context.Hotels
            .FirstOrDefaultAsync(h => h.Id == request.Id, cancellationToken);

        if (hotel is null)
            return Result.NotFound($"Hotel with id {request.Id} was not found.");

        hotel.Name = request.Name.Trim();
        hotel.Description = request.Description.Trim();
        hotel.Address = request.Address.Trim();
        hotel.City = request.City.Trim();
        hotel.Country = request.Country.Trim();
        hotel.Email = request.Email.Trim();
        hotel.PhoneNumber = request.PhoneNumber.Trim();
        hotel.StarRating = request.StarRating;
        hotel.IsActive = request.IsActive;

        await unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}

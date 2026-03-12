using HotelBookingPlatform.Application.Common.Interfaces;
using HotelBookingPlatform.Application.Common.Models;
using HotelBookingPlatform.Domain.Entities;

namespace HotelBookingPlatform.Application.Hotels.Commands.CreateHotel;

public record CreateHotelCommand(
    string Name,
    string Description,
    string Address,
    string City,
    string Country,
    string Email,
    string PhoneNumber,
    int StarRating) : IRequest<Result<int>>;

public class CreateHotelCommandHandler(
    IApplicationDbContext context,
    IUnitOfWork unitOfWork)
    : IRequestHandler<CreateHotelCommand, Result<int>>
{
    public async Task<Result<int>> Handle(CreateHotelCommand request, CancellationToken cancellationToken)
    {
        var hotel = new Hotel
        {
            Name = request.Name.Trim(),
            Description = request.Description.Trim(),
            Address = request.Address.Trim(),
            City = request.City.Trim(),
            Country = request.Country.Trim(),
            Email = request.Email.Trim(),
            PhoneNumber = request.PhoneNumber.Trim(),
            StarRating = request.StarRating,
            IsActive = true
        };

        context.Hotels.Add(hotel);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<int>.Success(hotel.Id);
    }
}

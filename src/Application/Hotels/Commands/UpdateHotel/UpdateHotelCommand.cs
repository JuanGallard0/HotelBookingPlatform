using HotelBookingPlatform.Application.Common.Models;

namespace HotelBookingPlatform.Application.Hotels.Commands.UpdateHotel;

using System.Text.Json.Serialization;

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

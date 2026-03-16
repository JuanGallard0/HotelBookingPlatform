namespace HotelBookingPlatform.Application.Hotels.Commands.BulkUpdateRoomInventory;

public class BulkUpdateRoomInventoryCommandValidator : AbstractValidator<BulkUpdateRoomInventoryCommand>
{
    public BulkUpdateRoomInventoryCommandValidator()
    {
        RuleFor(x => x.RoomTypeId)
            .GreaterThan(0).WithMessage("El id del tipo de habitación debe ser mayor que 0.");

        RuleFor(x => x.To)
            .GreaterThanOrEqualTo(x => x.From)
            .WithMessage("La fecha de fin debe ser mayor o igual a la fecha de inicio.");

        RuleFor(x => x.TotalRooms)
            .GreaterThanOrEqualTo(0).WithMessage("El total de habitaciones debe ser mayor o igual a 0.");

        RuleFor(x => x.AvailableRooms)
            .GreaterThanOrEqualTo(0).WithMessage("Las habitaciones disponibles deben ser mayor o igual a 0.")
            .LessThanOrEqualTo(x => x.TotalRooms).WithMessage("Las habitaciones disponibles no pueden exceder el total de habitaciones.");
    }
}

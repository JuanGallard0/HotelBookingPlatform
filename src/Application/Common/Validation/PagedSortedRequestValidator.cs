using HotelBookingPlatform.Application.Common.Models;

namespace HotelBookingPlatform.Application.Common.Validation;

public class PagedSortedRequestValidator<T> : AbstractValidator<T>
    where T : PagedSortedRequest
{
    public PagedSortedRequestValidator(IReadOnlySet<string>? allowedSortColumns = null)
    {
        RuleFor(x => x.PageNumber)
            .GreaterThanOrEqualTo(1)
            .WithMessage("El número de página debe ser al menos 1.")
            .When(x => x.PageNumber.HasValue);

        RuleFor(x => x.PageSize)
            .InclusiveBetween(1, 100)
            .WithMessage("El tamaño de página debe estar entre 1 y 100.")
            .When(x => x.PageSize.HasValue);

        RuleFor(x => x.SortDirection)
            .Must(d => string.IsNullOrEmpty(d)
                       || d.Equals("asc", StringComparison.OrdinalIgnoreCase)
                       || d.Equals("desc", StringComparison.OrdinalIgnoreCase))
            .WithMessage("La dirección de ordenamiento debe ser 'asc' o 'desc'.");

        if (allowedSortColumns is { Count: > 0 })
        {
            RuleFor(x => x.SortBy)
                .Must(s => string.IsNullOrEmpty(s)
                           || allowedSortColumns.Contains(s, StringComparer.OrdinalIgnoreCase))
                .WithMessage($"La columna de ordenamiento debe ser una de: {string.Join(", ", allowedSortColumns)}.");
        }
    }
}

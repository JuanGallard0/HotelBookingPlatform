using HotelBookingPlatform.Application.Common.Models;

namespace HotelBookingPlatform.Application.Common.Validation;

public class PagedSortedRequestValidator<T> : AbstractValidator<T>
    where T : PagedSortedRequest
{
    public PagedSortedRequestValidator(IReadOnlySet<string>? allowedSortColumns = null)
    {
        RuleFor(x => x.PageNumber)
            .GreaterThanOrEqualTo(1)
            .WithMessage("Page number must be at least 1.")
            .When(x => x.PageNumber.HasValue);

        RuleFor(x => x.PageSize)
            .InclusiveBetween(1, 100)
            .WithMessage("Page size must be between 1 and 100.")
            .When(x => x.PageSize.HasValue);

        RuleFor(x => x.SortDirection)
            .Must(d => string.IsNullOrEmpty(d)
                       || d.Equals("asc", StringComparison.OrdinalIgnoreCase)
                       || d.Equals("desc", StringComparison.OrdinalIgnoreCase))
            .WithMessage("Sort direction must be 'asc' or 'desc'.");

        if (allowedSortColumns is { Count: > 0 })
        {
            RuleFor(x => x.SortBy)
                .Must(s => string.IsNullOrEmpty(s)
                           || allowedSortColumns.Contains(s, StringComparer.OrdinalIgnoreCase))
                .WithMessage($"Sort column must be one of: {string.Join(", ", allowedSortColumns)}.");
        }
    }
}

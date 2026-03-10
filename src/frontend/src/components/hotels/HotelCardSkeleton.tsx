function HotelCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="h-44 animate-pulse bg-gray-200" aria-hidden="true" />
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="h-5 w-3/4 animate-pulse rounded bg-gray-200" aria-hidden="true" />
          <div className="h-4 w-16 animate-pulse rounded bg-gray-200" aria-hidden="true" />
        </div>
        <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200" aria-hidden="true" />
        <div className="space-y-1.5">
          <div className="h-3.5 w-full animate-pulse rounded bg-gray-200" aria-hidden="true" />
          <div className="h-3.5 w-5/6 animate-pulse rounded bg-gray-200" aria-hidden="true" />
        </div>
        <div className="mt-auto flex items-center justify-between pt-2">
          <div className="h-5 w-20 animate-pulse rounded-full bg-gray-200" aria-hidden="true" />
          <div className="h-4 w-16 animate-pulse rounded bg-gray-200" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}

interface HotelListSkeletonProps {
  count?: number;
}

export function HotelListSkeleton({ count = 12 }: HotelListSkeletonProps) {
  return (
    <div
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      aria-label="Loading hotels"
      aria-busy="true"
    >
      {Array.from({ length: count }).map((_, i) => (
        <HotelCardSkeleton key={i} />
      ))}
    </div>
  );
}

import { HotelListSkeleton } from "@/components/hotels/HotelCardSkeleton";

export default function HotelsLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 space-y-2" aria-hidden="true">
        <div className="h-7 w-24 animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-64 animate-pulse rounded bg-gray-200" />
      </div>
      <HotelListSkeleton />
    </div>
  );
}

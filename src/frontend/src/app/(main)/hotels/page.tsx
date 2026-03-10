import { Suspense } from "react";
import type { Metadata } from "next";
import { getHotels } from "@/lib/api/hotels";
import { HotelCard } from "@/components/hotels/HotelCard";
import { HotelFilters } from "@/components/hotels/HotelFilters";
import { HotelListSkeleton } from "@/components/hotels/HotelCardSkeleton";
import { Pagination } from "@/components/common/Pagination";
import { EmptyState } from "@/components/common/EmptyState";
import { HOTELS_PER_PAGE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Hotels",
  description: "Browse our curated selection of hotels worldwide.",
};

interface SearchParams {
  page?: string;
  sortBy?: string;
  sortDirection?: string;
  /** Maps to the API's `Name` filter parameter. */
  q?: string;
}

export default async function HotelsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Hotels</h1>
        <p className="mt-1 text-gray-500">
          Browse our curated selection of hotels worldwide
        </p>
      </div>

      {/* HotelFilters uses useSearchParams → must be wrapped in Suspense */}
      <div className="mb-6">
        <Suspense>
          <HotelFilters />
        </Suspense>
      </div>

      {/* Separate async component so filters/heading render while data loads */}
      <Suspense fallback={<HotelListSkeleton />}>
        <HotelResults
          page={page}
          name={params.q}
          sortBy={params.sortBy}
          sortDirection={params.sortDirection}
        />
      </Suspense>
    </div>
  );
}

async function HotelResults({
  page,
  name,
  sortBy,
  sortDirection,
}: {
  page: number;
  name?: string;
  sortBy?: string;
  sortDirection?: string;
}) {
  const data = await getHotels({
    pageNumber: page,
    pageSize: HOTELS_PER_PAGE,
    name,
    sortBy,
    sortDirection,
  });

  if (data.items.length === 0) {
    return (
      <EmptyState
        title="No hotels found"
        description="Try adjusting your search or filters."
        icon={
          <svg className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-500">
        Showing {data.items.length} of {data.totalCount} hotels
      </p>
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-label="Hotels list">
        {data.items.map((hotel) => (
          <li key={hotel.id}>
            <HotelCard hotel={hotel} />
          </li>
        ))}
      </ul>
      {/* Pagination uses useSearchParams → Suspense required */}
      <Suspense>
        <Pagination currentPage={page} totalPages={data.totalPages} />
      </Suspense>
    </div>
  );
}

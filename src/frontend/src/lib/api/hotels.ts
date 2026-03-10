import { HotelsClient } from "@/lib/api/api-client";
import type { HotelDto, HotelDetailDto } from "@/types/hotel";
import type { PagedResponse } from "@/types/common";
import { API_BASE_URL } from "@/lib/constants";

interface GetHotelsParams {
  name?: string;
  city?: string;
  country?: string;
  starRating?: number;
  pageNumber?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: string;
}

function makeClient(revalidate: number | false = 60) {
  return new HotelsClient(API_BASE_URL, {
    fetch: (url, init) =>
      fetch(url as string, {
        ...(init as RequestInit),
        next: revalidate === false ? { revalidate: 0 } : { revalidate },
      } as RequestInit),
  });
}

export async function getHotels(
  params: GetHotelsParams = {}
): Promise<PagedResponse<HotelDto>> {
  const {
    name,
    city,
    country,
    starRating,
    pageNumber = 1,
    pageSize = 12,
    sortBy,
    sortDirection,
  } = params;

  const res = await makeClient().getHotels(
    name,
    city,
    country,
    starRating,
    undefined,
    undefined,
    undefined,
    undefined,
    pageNumber,
    pageSize,
    sortBy,
    sortDirection
  );

  if (!res.success || !res.data) {
    throw new Error(res.errorMessage ?? "Failed to fetch hotels");
  }

  return {
    items: (res.data.data as HotelDto[]) ?? [],
    totalCount: res.data.totalRecords ?? 0,
    pageNumber: res.data.pageNumber ?? pageNumber,
    pageSize: res.data.pageSize ?? pageSize,
    totalPages: res.data.totalPages ?? 1,
  };
}

export async function getHotel(id: number): Promise<HotelDetailDto | null> {
  const res = await makeClient().hotels(id);

  if (!res.success) return null;
  return (res.data as HotelDetailDto) ?? null;
}

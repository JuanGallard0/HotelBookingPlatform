import {
  CreateHotelCommand,
  HotelsClient,
  HotelAvailabilityDto,
  SwaggerException,
  UpdateHotelCommand,
  type HotelDto,
} from "@/src/lib/api/generated/api-client";
import { API_BASE_URL } from "@/src/lib/constants";

const baseFetch: typeof fetch = (input, init) => globalThis.fetch(input, init);

function getBaseUrl() {
  return typeof window === "undefined" ? API_BASE_URL : "";
}

function makeClient(accessToken?: string) {
  const baseUrl = getBaseUrl();

  if (!accessToken) {
    return new HotelsClient(baseUrl, { fetch: baseFetch });
  }

  const authenticatedFetch: typeof fetch = (input, init) => {
    const headers = new Headers(init?.headers);
    headers.set("Authorization", `Bearer ${accessToken}`);
    return globalThis.fetch(input, { ...init, headers });
  };

  return new HotelsClient(baseUrl, { fetch: authenticatedFetch });
}

function getApiErrorMessage(error: unknown, fallback: string) {
  if (error instanceof SwaggerException) {
    const result = (error as SwaggerException & { result?: unknown }).result as
      | { errorMessage?: string; message?: string }
      | undefined;
    return result?.errorMessage ?? result?.message ?? fallback;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}

export function toErrorMessage(error: unknown, fallback: string) {
  return getApiErrorMessage(error, fallback);
}

export async function getHotelDetail(id: number, accessToken?: string) {
  const response = await makeClient(accessToken).hotelsGET(id);

  if (!response.success || !response.data) {
    throw response;
  }

  return response.data as HotelDto;
}

export async function getHotelAvailability(
  hotelId: number,
  checkIn?: Date,
  checkOut?: Date,
  numberOfGuests?: number,
  numberOfRooms?: number,
  accessToken?: string,
) {
  function toDateOnly(d: Date) {
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
  }

  const base = getBaseUrl();
  let url = `${base}/api/v1/hotels/${hotelId}/availability?`;
  if (checkIn) url += `checkIn=${toDateOnly(checkIn)}&`;
  if (checkOut) url += `checkOut=${toDateOnly(checkOut)}&`;
  if (numberOfGuests !== undefined) url += `numberOfGuests=${numberOfGuests}&`;
  if (numberOfRooms !== undefined) url += `numberOfRooms=${numberOfRooms}&`;
  url = url.replace(/[?&]$/, "");

  const headers: Record<string, string> = { Accept: "application/json" };
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  const res = await fetch(url, { headers });
  const json = await res.json();

  if (!json.success || !json.data) {
    throw json;
  }

  return HotelAvailabilityDto.fromJS(json.data);
}

export async function listHotels(accessToken?: string) {
  const response = await makeClient(accessToken).getAvailableHotels(
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    1,
    100,
    "name",
    "asc",
  );

  if (!response.success || !response.data) {
    throw response;
  }

  return response.data.data ?? [];
}

export async function createHotel(
  input: {
    name: string;
    description: string;
    address: string;
    city: string;
    country: string;
    email: string;
    phoneNumber: string;
    starRating: number;
  },
  accessToken?: string,
) {
  const body = new CreateHotelCommand(input);
  const response = await makeClient(accessToken).createHotel(body);

  if (!response.success) {
    throw response;
  }

  return response.data ?? null;
}

export async function updateHotel(
  input: {
    id: number;
    name: string;
    description: string;
    address: string;
    city: string;
    country: string;
    email: string;
    phoneNumber: string;
    starRating: number;
    isActive: boolean;
  },
  accessToken?: string,
) {
  const body = new UpdateHotelCommand(input);
  const response = await makeClient(accessToken).hotelsPUT(input.id, body);

  if (!response.success) {
    throw response;
  }
}

export async function deleteHotel(id: number, accessToken?: string) {
  const response = await makeClient(accessToken).hotelsDELETE(id);

  if (!response.success) {
    throw response;
  }
}

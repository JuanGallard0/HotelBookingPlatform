import {
  CreateHotelCommand,
  CreateRoomTypeCommand,
  HotelsClient,
  SwaggerException,
  UpdateHotelCommand,
  UpdateRoomTypeCommand,
  type HotelDetailDto,
  type HotelDto,
  type RoomTypeDto,
} from "@/src/lib/api/generated/api-client";
import { API_BASE_URL } from "@/src/lib/constants";

function makeClient(accessToken?: string) {
  if (!accessToken) {
    return new HotelsClient(API_BASE_URL, { fetch });
  }

  const authenticatedFetch: typeof fetch = (input, init) => {
    const headers = new Headers(init?.headers);
    headers.set("Authorization", `Bearer ${accessToken}`);
    return fetch(input, { ...init, headers });
  };

  return new HotelsClient(API_BASE_URL, { fetch: authenticatedFetch });
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

export async function listHotels(accessToken?: string) {
  const response = await makeClient(accessToken).getHotels(
    undefined,
    undefined,
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
    throw new Error(response.errorMessage ?? "Failed to load hotels.");
  }

  return (response.data.data as HotelDto[] | undefined) ?? [];
}

export async function getHotelDetail(id: number, accessToken?: string) {
  const response = await makeClient(accessToken).hotelsGET(id);

  if (!response.success || !response.data) {
    throw new Error(response.errorMessage ?? "Failed to load hotel details.");
  }

  return response.data as HotelDetailDto;
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
    throw new Error(response.errorMessage ?? "Failed to create hotel.");
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
    throw new Error(response.errorMessage ?? "Failed to update hotel.");
  }
}

export async function deleteHotel(id: number, accessToken?: string) {
  const response = await makeClient(accessToken).hotelsDELETE(id);

  if (!response.success) {
    throw new Error(response.errorMessage ?? "Failed to delete hotel.");
  }
}

export async function listRoomTypes(hotelId: number, accessToken?: string) {
  const response = await makeClient(accessToken).roomTypesGET(
    hotelId,
    undefined,
    1,
    100,
    "name",
    "asc",
  );

  if (!response.success || !response.data) {
    throw new Error(response.errorMessage ?? "Failed to load room types.");
  }

  return (response.data.data as RoomTypeDto[] | undefined) ?? [];
}

export async function createRoomType(
  input: {
    hotelId: number;
    name: string;
    description: string;
    maxOccupancy: number;
    basePrice: number;
  },
  accessToken?: string,
) {
  const body = new CreateRoomTypeCommand(input);
  const response = await makeClient(accessToken).roomTypesPOST(
    input.hotelId,
    body,
  );

  if (!response.success) {
    throw new Error(response.errorMessage ?? "Failed to create room type.");
  }

  return response.data ?? null;
}

export async function updateRoomType(
  input: {
    hotelId: number;
    id: number;
    name: string;
    description: string;
    maxOccupancy: number;
    basePrice: number;
    isActive: boolean;
  },
  accessToken?: string,
) {
  const body = new UpdateRoomTypeCommand(input);
  const response = await makeClient(accessToken).roomTypesPUT(
    input.hotelId,
    input.id,
    body,
  );

  if (!response.success) {
    throw new Error(response.errorMessage ?? "Failed to update room type.");
  }
}

export async function deleteRoomType(
  hotelId: number,
  id: number,
  accessToken?: string,
) {
  const response = await makeClient(accessToken).roomTypesDELETE(hotelId, id);

  if (!response.success) {
    throw new Error(response.errorMessage ?? "Failed to delete room type.");
  }
}

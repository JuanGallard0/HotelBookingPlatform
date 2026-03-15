import {
  BulkUpdateRoomInventoryCommand,
  CreateHotelCommand,
  CreateRatePlanCommand,
  CreateRoomTypeCommand,
  HotelsClient,
  RatePlansClient,
  RoomTypesClient,
  SwaggerException,
  UpdateHotelCommand,
  UpdateRatePlanCommand,
  UpdateRoomTypeCommand,
  UpsertRoomInventoryCommand,
  type HotelDetailsDto,
  type HotelDto,
  type HotelInventoryDto,
} from "@/src/lib/api/generated/api-client";
import { API_BASE_URL } from "@/src/lib/constants";

const baseFetch: typeof fetch = (input, init) => globalThis.fetch(input, init);

function createAuthenticatedFetch(accessToken?: string): typeof fetch {
  if (!accessToken) {
    return baseFetch;
  }

  return (input, init) => {
    const headers = new Headers(init?.headers);
    headers.set("Authorization", `Bearer ${accessToken}`);
    return globalThis.fetch(input, { ...init, headers });
  };
}

function getBaseUrl() {
  return typeof window === "undefined" ? API_BASE_URL : "";
}

function formatDateOnly(date: Date) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
}

function makeHotelsClient(accessToken?: string) {
  return new HotelsClient(getBaseUrl(), {
    fetch: createAuthenticatedFetch(accessToken),
  });
}

function makeRoomTypesClient(accessToken?: string) {
  return new RoomTypesClient(getBaseUrl(), {
    fetch: createAuthenticatedFetch(accessToken),
  });
}

function makeRatePlansClient(accessToken?: string) {
  return new RatePlansClient(getBaseUrl(), {
    fetch: createAuthenticatedFetch(accessToken),
  });
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

export function toAdminErrorMessage(error: unknown, fallback: string) {
  return getApiErrorMessage(error, fallback);
}

export function isAdminAccessError(error: unknown) {
  return error instanceof SwaggerException && (error.status === 401 || error.status === 403);
}

export async function getAdminHotels(accessToken?: string) {
  const response = await makeHotelsClient(accessToken).list(
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    1,
    100,
    "Name",
    "asc",
  );

  if (!response.success || !response.data) {
    throw response;
  }

  return (response.data.data ?? []) as HotelDto[];
}

export async function getAdminHotelDetails(
  hotelId: number,
  accessToken?: string,
) {
  const response = await makeHotelsClient(accessToken).details(hotelId);

  if (!response.success || !response.data) {
    throw response;
  }

  return response.data as HotelDetailsDto;
}

export async function getAdminHotelInventory(
  hotelId: number,
  from: Date,
  to: Date,
  accessToken?: string,
) {
  const headers = new Headers({ Accept: "application/json" });
  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const response = await fetch(
    `${getBaseUrl()}/api/v1/hotels/${hotelId}/inventory?from=${formatDateOnly(from)}&to=${formatDateOnly(to)}`,
    {
      method: "GET",
      headers,
    },
  );

  const payload = (await response.json()) as {
    success: boolean;
    data?: HotelInventoryDto;
    errorMessage?: string;
    validationErrors?: Record<string, string[]>;
  };

  if (!response.ok || !payload.success || !payload.data) {
    throw payload;
  }

  return payload.data as HotelInventoryDto;
}

export async function createAdminHotel(
  input: ConstructorParameters<typeof CreateHotelCommand>[0],
  accessToken?: string,
) {
  const response = await makeHotelsClient(accessToken).createHotel(
    new CreateHotelCommand(input),
  );

  if (!response.success) {
    throw response;
  }

  return response.data ?? null;
}

export async function updateAdminHotel(
  hotelId: number,
  input: ConstructorParameters<typeof UpdateHotelCommand>[0],
  accessToken?: string,
) {
  const response = await makeHotelsClient(accessToken).hotelsPUT(
    hotelId,
    new UpdateHotelCommand(input),
  );

  if (!response.success) {
    throw response;
  }
}

export async function deleteAdminHotel(hotelId: number, accessToken?: string) {
  const response = await makeHotelsClient(accessToken).hotelsDELETE(hotelId);

  if (!response.success) {
    throw response;
  }
}

export async function createAdminRoomType(
  hotelId: number,
  input: ConstructorParameters<typeof CreateRoomTypeCommand>[0],
  accessToken?: string,
) {
  const response = await makeHotelsClient(accessToken).roomTypesPOST(
    hotelId,
    new CreateRoomTypeCommand(input),
  );

  if (!response.success) {
    throw response;
  }

  return response.data ?? null;
}

export async function updateAdminRoomType(
  roomTypeId: number,
  input: ConstructorParameters<typeof UpdateRoomTypeCommand>[0],
  accessToken?: string,
) {
  const response = await makeRoomTypesClient(accessToken).roomTypesPUT(
    roomTypeId,
    new UpdateRoomTypeCommand(input),
  );

  if (!response.success) {
    throw response;
  }
}

export async function deleteAdminRoomType(
  roomTypeId: number,
  accessToken?: string,
) {
  const response = await makeRoomTypesClient(accessToken).roomTypesDELETE(
    roomTypeId,
  );

  if (!response.success) {
    throw response;
  }
}

export async function createAdminRatePlan(
  roomTypeId: number,
  input: ConstructorParameters<typeof CreateRatePlanCommand>[0],
  accessToken?: string,
) {
  const response = await makeRoomTypesClient(accessToken).ratePlansPOST(
    roomTypeId,
    new CreateRatePlanCommand(input),
  );

  if (!response.success) {
    throw response;
  }

  return response.data ?? null;
}

export async function updateAdminRatePlan(
  ratePlanId: number,
  input: ConstructorParameters<typeof UpdateRatePlanCommand>[0],
  accessToken?: string,
) {
  const response = await makeRatePlansClient(accessToken).ratePlansPUT(
    ratePlanId,
    new UpdateRatePlanCommand(input),
  );

  if (!response.success) {
    throw response;
  }
}

export async function deleteAdminRatePlan(
  ratePlanId: number,
  accessToken?: string,
) {
  const response = await makeRatePlansClient(accessToken).ratePlansDELETE(
    ratePlanId,
  );

  if (!response.success) {
    throw response;
  }
}

export async function upsertAdminInventory(
  roomTypeId: number,
  date: Date,
  input: ConstructorParameters<typeof UpsertRoomInventoryCommand>[0],
  accessToken?: string,
) {
  const headers = new Headers({
    Accept: "application/json",
    "Content-Type": "application/json",
  });
  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const response = await fetch(
    `${getBaseUrl()}/api/v1/room-types/${roomTypeId}/inventory/${formatDateOnly(date)}`,
    {
      method: "PUT",
      headers,
      body: JSON.stringify(new UpsertRoomInventoryCommand(input)),
    },
  );

  const payload = (await response.json()) as {
    success: boolean;
    errorMessage?: string;
    validationErrors?: Record<string, string[]>;
  };

  if (!response.ok || !payload.success) {
    throw payload;
  }
}

export async function bulkUpdateAdminInventory(
  roomTypeId: number,
  input: ConstructorParameters<typeof BulkUpdateRoomInventoryCommand>[0],
  accessToken?: string,
) {
  const response = await makeRoomTypesClient(accessToken).bulk(
    roomTypeId,
    new BulkUpdateRoomInventoryCommand(input),
  );

  if (!response.success) {
    throw response;
  }
}

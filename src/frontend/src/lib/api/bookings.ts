import {
  BookingsClient,
  CreateBookingCommand,
  GuestInfoDto,
  SwaggerException,
  type BookingDto,
} from "@/src/lib/api/generated/api-client";
import { API_BASE_URL } from "@/src/lib/constants";

function makeClient(accessToken?: string) {
  if (!accessToken) {
    return new BookingsClient(API_BASE_URL, { fetch });
  }

  const authenticatedFetch: typeof fetch = (input, init) => {
    const headers = new Headers(init?.headers);
    headers.set("Authorization", `Bearer ${accessToken}`);
    return fetch(input, { ...init, headers });
  };

  return new BookingsClient(API_BASE_URL, { fetch: authenticatedFetch });
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

export interface CreateBookingInput {
  roomTypeId: number;
  checkIn: Date;
  checkOut: Date;
  numberOfGuests: number;
  numberOfRooms: number;
  guest: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    documentType?: string;
    documentNumber?: string;
    dateOfBirth?: Date;
    nationality?: string;
  };
  specialRequests?: string;
  idempotencyKey?: string;
}

export async function createBooking(
  input: CreateBookingInput,
  accessToken?: string,
): Promise<BookingDto> {
  const body = new CreateBookingCommand({
    roomTypeId: input.roomTypeId,
    checkIn: input.checkIn,
    checkOut: input.checkOut,
    numberOfGuests: input.numberOfGuests,
    numberOfRooms: input.numberOfRooms,
    guest: new GuestInfoDto({
      firstName: input.guest.firstName,
      lastName: input.guest.lastName,
      email: input.guest.email,
      phoneNumber: input.guest.phoneNumber,
      documentType: input.guest.documentType,
      documentNumber: input.guest.documentNumber,
      dateOfBirth: input.guest.dateOfBirth,
      nationality: input.guest.nationality,
    }),
    specialRequests: input.specialRequests,
    idempotencyKey: input.idempotencyKey,
  });

  const response = await makeClient(accessToken).createBooking(
    input.idempotencyKey,
    body,
  );

  if (!response.success || !response.data) {
    throw new Error(response.errorMessage ?? "Failed to create booking.");
  }

  return response.data;
}

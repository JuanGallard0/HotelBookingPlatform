import {
  type BookingDetailsDto,
  BookingsClient,
  CancelBookingRequest,
  CreateBookingCommand,
  GuestInfoDto,
  SwaggerException,
  type BookingDto,
  type UserBookingDto,
} from "@/src/lib/api/generated/api-client";
import { API_BASE_URL } from "@/src/lib/constants";

const baseFetch: typeof fetch = (input, init) => globalThis.fetch(input, init);
const browserBaseUrl = typeof window === "undefined" ? API_BASE_URL : "";

function makeClient(accessToken?: string) {
  const base = browserBaseUrl;

  if (!accessToken) {
    return new BookingsClient(base, { fetch: baseFetch });
  }

  const authenticatedFetch: typeof fetch = (input, init) => {
    const headers = new Headers(init?.headers);
    headers.set("Authorization", `Bearer ${accessToken}`);
    return globalThis.fetch(input, { ...init, headers });
  };

  return new BookingsClient(base, { fetch: authenticatedFetch });
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

export type UserBookingStatus =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "checked-in"
  | "checked-out"
  | "no-show";

export type UserBookingsSortBy =
  | "BookingId"
  | "CheckIn"
  | "CheckOut"
  | "TotalAmount"
  | "Status"
  | "CreatedAt";

export type UserBookingsSortDirection = "asc" | "desc";

export type GetMyBookingsInput = {
  accessToken?: string;
  status?: UserBookingStatus;
  pageNumber?: number;
  pageSize?: number;
  sortBy?: UserBookingsSortBy;
  sortDirection?: UserBookingsSortDirection;
};

export type GetMyBookingsResult = {
  items: UserBookingDto[];
  pageNumber: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
};

export type BookingDetails = BookingDetailsDto;

const userBookingStatusMap: Record<UserBookingStatus, number> = {
  pending: 0,
  confirmed: 1,
  cancelled: 2,
  "checked-in": 3,
  "checked-out": 4,
  "no-show": 5,
};

export function getUserBookingStatusLabel(status?: number) {
  switch (status) {
    case 0:
      return "Pendiente";
    case 1:
      return "Confirmada";
    case 2:
      return "Cancelada";
    case 3:
      return "Check-in";
    case 4:
      return "Check-out";
    case 5:
      return "No show";
    default:
      return "Desconocida";
  }
}

export async function getMyBookings({
  accessToken,
  status,
  pageNumber = 1,
  pageSize = 10,
  sortBy = "CreatedAt",
  sortDirection = "desc",
}: GetMyBookingsInput): Promise<GetMyBookingsResult> {
  const response = await makeClient(accessToken).me(
    status ? userBookingStatusMap[status] : undefined,
    pageNumber,
    pageSize,
    sortBy,
    sortDirection,
  );

  if (!response.success || !response.data) {
    throw response;
  }

  return {
    items: response.data.data ?? [],
    pageNumber: response.data.pageNumber ?? pageNumber,
    pageSize: response.data.pageSize ?? pageSize,
    totalRecords: response.data.totalRecords ?? 0,
    totalPages: response.data.totalPages ?? 1,
  };
}

export async function getBookingById(
  bookingId: number,
  accessToken?: string,
): Promise<BookingDetails> {
  const response = await makeClient(accessToken).bookings(bookingId);

  if (!response.success || !response.data) {
    throw response;
  }

  return response.data;
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
    throw response;
  }

  return response.data;
}

export async function confirmBooking(
  bookingId: number,
  accessToken?: string,
): Promise<void> {
  const response = await makeClient(accessToken).confirm(bookingId);

  if (!response.success) {
    throw response;
  }
}

export async function cancelBooking(
  bookingId: number,
  reason: string,
  accessToken?: string,
): Promise<void> {
  const response = await makeClient(accessToken).cancel(
    bookingId,
    new CancelBookingRequest({ reason }),
  );

  if (!response.success) {
    throw response;
  }
}

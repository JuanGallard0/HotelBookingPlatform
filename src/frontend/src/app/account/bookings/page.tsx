"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpDown,
  CalendarRange,
  ReceiptText,
} from "lucide-react";

import { useAuth } from "@/src/context/AuthContext";
import {
  getMyBookings,
  getUserBookingStatusLabel,
  toErrorMessage,
  type UserBookingsSortBy,
  type UserBookingsSortDirection,
  type UserBookingStatus,
} from "@/src/lib/api/bookings";
import type { UserBookingDto } from "@/src/lib/api/generated/api-client";
import { Button } from "@/src/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";

const PAGE_SIZE = 5;

const statusOptions: Array<{
  label: string;
  value: "all" | UserBookingStatus;
}> = [
  { label: "Todas", value: "all" },
  { label: "Pendiente", value: "pending" },
  { label: "Confirmada", value: "confirmed" },
  { label: "Cancelada", value: "cancelled" },
  { label: "Check-in", value: "checked-in" },
  { label: "Check-out", value: "checked-out" },
  { label: "No show", value: "no-show" },
];

const sortOptions: Array<{
  label: string;
  value: `${UserBookingsSortBy}:${UserBookingsSortDirection}`;
}> = [
  { label: "Creacion reciente", value: "CreatedAt:desc" },
  { label: "Check-in mas proximo", value: "CheckIn:asc" },
  { label: "Check-out mas lejano", value: "CheckOut:desc" },
  { label: "Monto mas alto", value: "TotalAmount:desc" },
  { label: "Estado", value: "Status:asc" },
];

function isUserBookingStatus(value: string | null): value is UserBookingStatus {
  return (
    value === "pending" ||
    value === "confirmed" ||
    value === "cancelled" ||
    value === "checked-in" ||
    value === "checked-out" ||
    value === "no-show"
  );
}

function isUserBookingsSortBy(value: string): value is UserBookingsSortBy {
  return (
    value === "BookingId" ||
    value === "CheckIn" ||
    value === "CheckOut" ||
    value === "TotalAmount" ||
    value === "Status" ||
    value === "CreatedAt"
  );
}

function isUserBookingsSortDirection(
  value: string,
): value is UserBookingsSortDirection {
  return value === "asc" || value === "desc";
}

function formatDate(value?: Date) {
  if (!value) return "Sin fecha";
  return new Intl.DateTimeFormat("es-SV", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(value);
}

function formatMoney(amount?: number, currency?: string) {
  if (amount == null) return "Sin monto";

  return new Intl.NumberFormat("es-SV", {
    style: "currency",
    currency: currency || "USD",
    minimumFractionDigits: 2,
  }).format(amount);
}

export default function AccountBookingsPage() {
  const { authReady, isAuthenticated, runWithAuth } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [items, setItems] = useState<UserBookingDto[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [loadedKey, setLoadedKey] = useState<string | null>(null);

  const status =
    searchParams.get("status") === "all"
      ? "all"
      : isUserBookingStatus(searchParams.get("status"))
        ? searchParams.get("status")
        : "all";

  const sortParam = searchParams.get("sort") ?? "CreatedAt:desc";
  const [sortByRaw, sortDirectionRaw] = sortParam.split(":");
  const sortBy = isUserBookingsSortBy(sortByRaw) ? sortByRaw : "CreatedAt";
  const sortDirection = isUserBookingsSortDirection(sortDirectionRaw)
    ? sortDirectionRaw
    : "desc";

  const page = Math.max(Number(searchParams.get("page") ?? "1") || 1, 1);
  const requestKey = isAuthenticated
    ? `${status}:${sortBy}:${sortDirection}:${page}`
    : null;
  const loading = requestKey !== null && loadedKey !== requestKey;

  function updateQuery(next: {
    status?: "all" | UserBookingStatus;
    sort?: `${UserBookingsSortBy}:${UserBookingsSortDirection}`;
    page?: number;
  }) {
    const params = new URLSearchParams(searchParams.toString());
    const nextStatus = next.status ?? status;
    const nextSort = next.sort ?? `${sortBy}:${sortDirection}`;
    const nextPage = next.page ?? page;

    if (nextStatus === "all") {
      params.delete("status");
    } else {
      params.set("status", nextStatus);
    }

    params.set("sort", nextSort);

    if (nextPage <= 1) {
      params.delete("page");
    } else {
      params.set("page", String(nextPage));
    }

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  }

  useEffect(() => {
    if (authReady && !isAuthenticated) {
      router.replace("/");
      return;
    }

    if (!isAuthenticated) {
      return;
    }

    let cancelled = false;

    runWithAuth(() =>
      getMyBookings({
        status: status === "all" ? undefined : status,
        pageNumber: page,
        pageSize: PAGE_SIZE,
        sortBy,
        sortDirection,
      }),
    )
      .then((result) => {
        if (cancelled) return;
        setItems(result.items);
        setTotalRecords(result.totalRecords);
        setTotalPages(Math.max(result.totalPages, 1));
        setError(null);
        setLoadedKey(requestKey);
      })
      .catch((err) => {
        if (cancelled) return;
        setItems([]);
        setTotalRecords(0);
        setTotalPages(1);
        setError(
          toErrorMessage(err, "No se pudieron cargar las reservas del usuario."),
        );
        setLoadedKey(requestKey);
      });

    return () => {
      cancelled = true;
    };
  }, [
    authReady,
    isAuthenticated,
    page,
    requestKey,
    router,
    runWithAuth,
    sortBy,
    sortDirection,
    status,
  ]);

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">
          Cuenta
        </p>
        <h1 className="text-3xl font-semibold text-foreground">Mis reservas</h1>
        <p className="text-sm text-muted-foreground">
          Consulta real del endpoint `bookings/me`, con filtro, orden y
          paginacion por query string.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center gap-3 space-y-0">
            <CalendarRange className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Reservas visibles</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-foreground">
              {loading ? "..." : totalRecords}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center gap-3 space-y-0">
            <ReceiptText className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Accion rapida</CardTitle>
          </CardHeader>
          <CardContent>
            <Link href="/hotels">
              <Button>Explorar hoteles</Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2">
            {statusOptions.map((option) => (
              <Button
                key={option.value}
                type="button"
                variant={status === option.value ? "default" : "outline"}
                size="sm"
                onClick={() => updateQuery({ status: option.value, page: 1 })}
              >
                {option.label}
              </Button>
            ))}
          </div>

          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <ArrowUpDown className="h-4 w-4" />
            <select
              className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
              value={`${sortBy}:${sortDirection}`}
              onChange={(event) =>
                updateQuery({
                  sort: event.target.value as `${UserBookingsSortBy}:${UserBookingsSortDirection}`,
                  page: 1,
                })
              }
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </CardContent>
      </Card>

      {error && (
        <Card>
          <CardContent className="p-6 text-sm text-red-600">{error}</CardContent>
        </Card>
      )}

      {isAuthenticated && !error && (
        <div className="grid gap-4">
          {loading && (
            <Card>
              <CardContent className="p-6 text-sm text-muted-foreground">
                Cargando reservas...
              </CardContent>
            </Card>
          )}

          {!loading &&
            items.map((booking) => (
              <Card key={booking.bookingId ?? booking.bookingNumber}>
                <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {booking.bookingNumber || `#${booking.bookingId}`}
                    </p>
                    <h2 className="mt-1 text-lg font-semibold text-foreground">
                      {booking.hotelName || "Hotel sin nombre"}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {booking.roomTypeName || "Habitacion"} ·{" "}
                      {formatDate(booking.checkIn)} - {formatDate(booking.checkOut)}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {booking.numberOfGuests ?? 0} huespedes ·{" "}
                      {booking.numberOfRooms ?? 0} habitaciones ·{" "}
                      {booking.nights ?? 0} noches
                    </p>
                  </div>

                  <div className="flex flex-col items-start gap-2 sm:items-end">
                    <span className="inline-flex w-fit rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                      {getUserBookingStatusLabel(booking.status)}
                    </span>
                    <p className="text-sm font-semibold text-foreground">
                      {formatMoney(booking.totalAmount, booking.currency)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}

          {!loading && items.length === 0 && (
            <Card>
              <CardContent className="p-6 text-sm text-muted-foreground">
                No hay reservas para el filtro seleccionado.
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {isAuthenticated && !loading && !error && totalPages > 1 && (
        <Card>
          <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Pagina {page} de {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => updateQuery({ page: page - 1 })}
              >
                <ArrowLeft className="h-4 w-4" />
                Anterior
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => updateQuery({ page: page + 1 })}
              >
                Siguiente
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </main>
  );
}

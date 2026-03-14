"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { format, parse, isValid } from "date-fns";
import { es } from "date-fns/locale";
import { ArrowLeft, Check } from "lucide-react";
import { createBooking } from "@/src/lib/api/bookings";
import { handleApiError } from "@/src/lib/api/handle-error";
import { useAuth } from "@/src/context/AuthContext";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Separator } from "@/src/components/ui/separator";
import type { BookingDto } from "@/src/lib/api/generated/api-client";

function parseDate(value: string | null): Date | null {
  if (!value) return null;
  const d = parse(value, "yyyy-MM-dd", new Date());
  return isValid(d) ? d : null;
}

function nights(checkIn: Date, checkOut: Date) {
  return Math.round(
    (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24),
  );
}

// -- Booking Confirmation -----------------------------------------------------

function BookingConfirmation({ booking }: { booking: BookingDto }) {
  return (
    <div className="mx-auto max-w-lg text-center py-16 px-4">
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mx-auto mb-6">
        <Check className="h-8 w-8 text-green-600" strokeWidth={2.5} />
      </div>
      <h1 className="text-2xl font-bold text-slate-900 mb-2">
        ¡Reserva confirmada!
      </h1>
      <p className="text-slate-500 mb-8">
        Tu reserva ha sido creada exitosamente.
      </p>

      <div className="rounded-xl border border-border bg-card p-6 text-left space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Número de reserva</span>
          <span className="font-semibold text-card-foreground">
            {booking.bookingNumber}
          </span>
        </div>
        <Separator />
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Habitación</span>
          <span className="font-medium text-card-foreground">
            {booking.roomTypeName}
          </span>
        </div>
        {booking.checkIn && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Check-in</span>
            <span className="font-medium text-card-foreground">
              {format(new Date(booking.checkIn), "dd/MM/yyyy", { locale: es })}
            </span>
          </div>
        )}
        {booking.checkOut && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Check-out</span>
            <span className="font-medium text-card-foreground">
              {format(new Date(booking.checkOut), "dd/MM/yyyy", { locale: es })}
            </span>
          </div>
        )}
        {booking.nights != null && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Noches</span>
            <span className="font-medium text-card-foreground">
              {booking.nights}
            </span>
          </div>
        )}
        <Separator />
        {booking.totalAmount != null && (
          <div className="flex justify-between text-sm font-semibold">
            <span className="text-muted-foreground">Total</span>
            <span className="text-card-foreground">
              {booking.totalAmount.toFixed(2)} {booking.currency}
            </span>
          </div>
        )}
      </div>

      <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
        <Link href="/account/bookings">
          <Button variant="outline">Ver mis reservaciones</Button>
        </Link>
        <Link href="/">
          <Button>Ir al inicio</Button>
        </Link>
      </div>
    </div>
  );
}

// -- Main Page ----------------------------------------------------------------

export default function NewBookingPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { authReady, isAuthenticated, runWithAuth, user } = useAuth();

  // Auth guard: redirect unauthenticated users to the previous page
  useEffect(() => {
    if (authReady && !isAuthenticated) {
      router.replace("/");
    }
  }, [authReady, isAuthenticated, router]);

  // Booking context from query params
  const roomTypeId = Number(searchParams.get("roomTypeId") ?? "0");
  const checkInStr = searchParams.get("checkIn") ?? "";
  const checkOutStr = searchParams.get("checkOut") ?? "";
  const guests = Number(searchParams.get("guests") ?? "1");
  const numberOfRooms = Number(searchParams.get("numberOfRooms") ?? "1");
  const roomName = searchParams.get("roomName") ?? "";
  const totalPrice = parseFloat(searchParams.get("totalPrice") ?? "0");
  const currency = searchParams.get("currency") ?? "";

  const checkIn = parseDate(checkInStr);
  const checkOut = parseDate(checkOutStr);
  const nightCount = checkIn && checkOut ? nights(checkIn, checkOut) : 0;

  // Form state — prefill with logged-in user data where available
  const [firstName, setFirstName] = useState(user?.firstName ?? "");
  const [lastName, setLastName] = useState(user?.lastName ?? "");
  const [email, setEmail] = useState(user?.email ?? "");

  useEffect(() => {
    if (user) {
      setFirstName((v) => v || (user.firstName ?? ""));
      setLastName((v) => v || (user.lastName ?? ""));
      setEmail((v) => v || (user.email ?? ""));
    }
  }, [user]);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [documentType, setDocumentType] = useState("");
  const [documentNumber, setDocumentNumber] = useState("");
  const [nationality, setNationality] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");

  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState<BookingDto | null>(null);
  const idempotencyKeyRef = useRef<string | null>(null);

  useEffect(() => {
    idempotencyKeyRef.current = null;
  }, [
    roomTypeId,
    checkInStr,
    checkOutStr,
    guests,
    numberOfRooms,
    firstName,
    lastName,
    email,
    phoneNumber,
    documentType,
    documentNumber,
    nationality,
    specialRequests,
  ]);

  if (!roomTypeId || !checkIn || !checkOut) {
    return (
      <main className="flex-1 flex items-center justify-center py-20 px-4">
        <div className="text-center">
          <p className="text-slate-500 mb-4">
            Parámetros de reserva inválidos.
          </p>
          <Link href="/hotels">
            <Button variant="outline">Ver hoteles</Button>
          </Link>
        </div>
      </main>
    );
  }

  if (booking) {
    return (
      <main className="flex-1">
        <BookingConfirmation booking={booking} />
      </main>
    );
  }

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();

    setLoading(true);
    try {
      idempotencyKeyRef.current ??= crypto.randomUUID();

      const result = await runWithAuth(() =>
        createBooking({
          roomTypeId,
          checkIn: checkIn!,
          checkOut: checkOut!,
          numberOfGuests: guests,
          numberOfRooms,
          guest: {
            firstName,
            lastName,
            email,
            phoneNumber,
            documentType: documentType || undefined,
            documentNumber: documentNumber || undefined,
            nationality: nationality || undefined,
          },
          specialRequests: specialRequests || undefined,
          idempotencyKey: idempotencyKeyRef.current,
        }),
      );
      setBooking(result);
    } catch (err) {
      handleApiError(err, "No se pudo completar la reserva. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex-1">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Back link */}
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2} />
          Volver
        </button>

        <h1 className="text-2xl font-bold text-slate-900 mb-8">
          Completar reserva
        </h1>

        <div className="grid space-y-6 lg:space-y-0 lg:gap-8 lg:grid-cols-3">
          {/* -- Form -- */}
          <form
            id="booking-form"
            onSubmit={handleSubmit}
            className="lg:col-span-2 space-y-8"
          >
            {/* Guest info */}
            <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-border">
                <h2 className="text-lg font-semibold text-card-foreground">
                  Datos del huésped principal
                </h2>
              </div>
              <div className="px-6 py-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="firstName">Nombre *</Label>
                  <Input
                    id="firstName"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Juan"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="lastName">Apellido *</Label>
                  <Input
                    id="lastName"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="García"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="email">Correo electrónico *</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="juan@example.com"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="phoneNumber">Teléfono *</Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="documentType">Tipo de documento</Label>
                  <Input
                    id="documentType"
                    value={documentType}
                    onChange={(e) => setDocumentType(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="documentNumber">Número de documento</Label>
                  <Input
                    id="documentNumber"
                    value={documentNumber}
                    onChange={(e) => setDocumentNumber(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <Label htmlFor="nationality">Nacionalidad</Label>
                  <Input
                    id="nationality"
                    value={nationality}
                    onChange={(e) => setNationality(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Special requests */}
            <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-border">
                <h2 className="text-lg font-semibold text-card-foreground">
                  Peticiones especiales
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Sujetas a disponibilidad, no garantizadas.
                </p>
              </div>
              <div className="px-6 py-6">
                <textarea
                  id="specialRequests"
                  rows={4}
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}

                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                />
              </div>
            </div>

            {/* Desktop-only submit button */}
            <Button
              type="submit"
              size="lg"
              className="hidden lg:block w-full"
              disabled={loading}
            >
              {loading ? "Procesando..." : "Reservar"}
            </Button>
          </form>

          {/* -- Summary -- */}
          <aside className="lg:col-span-1">
            <div className="sticky top-6 rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-border">
                <h2 className="text-lg font-semibold text-card-foreground">
                  Resumen
                </h2>
              </div>
              <div className="px-6 py-6 space-y-4 text-sm">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-0.5">
                    Habitación
                  </p>
                  <p className="font-semibold text-card-foreground">
                    {roomName}
                  </p>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-0.5">
                      Check-in
                    </p>
                    <p className="text-card-foreground">
                      {format(checkIn, "dd/MM/yyyy", { locale: es })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-0.5">
                      Check-out
                    </p>
                    <p className="text-card-foreground">
                      {format(checkOut, "dd/MM/yyyy", { locale: es })}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-0.5">
                      Noches
                    </p>
                    <p className="text-card-foreground">{nightCount}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-0.5">
                      Huéspedes
                    </p>
                    <p className="text-card-foreground">{guests}</p>
                  </div>
                </div>

                {numberOfRooms > 1 && (
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-0.5">
                      Habitaciones
                    </p>
                    <p className="text-card-foreground">{numberOfRooms}</p>
                  </div>
                )}

                <Separator />

                <div className="flex items-end justify-between">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Total
                  </p>
                  <p className="text-xl font-bold text-card-foreground">
                    {totalPrice.toFixed(2)} {currency}
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* Mobile-only submit button — rendered after the summary block */}
        <div className="lg:hidden mt-8 space-y-3">
          <Button
            type="submit"
            form="booking-form"
            size="lg"
            className="w-full"
            disabled={loading}
          >
            {loading ? "Procesando..." : "Confirmar reserva"}
          </Button>
        </div>
      </div>
    </main>
  );
}

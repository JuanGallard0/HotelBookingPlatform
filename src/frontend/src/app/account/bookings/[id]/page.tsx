"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { useAuth } from "@/src/context/AuthContext";
import {
  cancelBooking,
  confirmBooking,
  getBookingById,
  getUserBookingStatusLabel,
  type BookingDetails,
} from "@/src/lib/api/bookings";
import { handleApiError } from "@/src/lib/api/handle-error";
import { toast } from "sonner";
import { Button } from "@/src/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { Input } from "@/src/components/ui/input";
import { Separator } from "@/src/components/ui/separator";

const DEFAULT_CANCELLATION_REASON =
  "Cancelled by user from account booking detail.";

function formatDate(value?: Date | null) {
  if (!value) return "Sin fecha";

  return new Intl.DateTimeFormat("es-SV", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(value);
}

function formatDateTime(value?: Date | null) {
  if (!value) return "No disponible";

  return new Intl.DateTimeFormat("es-SV", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
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

type BookingActionDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel: string;
  confirmDisabled?: boolean;
  confirmLoading?: boolean;
  confirmVariant?: "default" | "destructive";
  children?: ReactNode;
  onConfirm: () => void;
};

function BookingActionDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  confirmDisabled,
  confirmLoading,
  confirmVariant = "default",
  children,
  onConfirm,
}: BookingActionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {children}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={confirmLoading}
            onClick={() => onOpenChange(false)}
          >
            Cerrar
          </Button>
          <Button
            type="button"
            variant={confirmVariant}
            disabled={confirmDisabled || confirmLoading}
            onClick={onConfirm}
          >
            {confirmLoading ? "Procesando..." : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-border/60 p-3">
      <span className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}

export default function BookingDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { authReady, isAuthenticated, runWithAuth, user } = useAuth();

  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState<"confirm" | "cancel" | null>(
    null,
  );

  const bookingId = Number(params.id);
  const normalizedUserEmail = useMemo(
    () => (user?.email ?? "").trim().toLowerCase(),
    [user?.email],
  );
  const canConfirm =
    emailInput.trim().toLowerCase() === normalizedUserEmail &&
    normalizedUserEmail.length > 0;

  function loadBooking() {
    if (!Number.isInteger(bookingId) || bookingId <= 0) {
      setBooking(null);
      handleApiError(new Error("El identificador de reserva no es valido."));
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    runWithAuth(() => getBookingById(bookingId))
      .then((result) => {
        setBooking(result);
      })
      .catch((err) => {
        setBooking(null);
        handleApiError(err, "No se pudo cargar el detalle de la reserva.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  useEffect(() => {
    if (authReady && !isAuthenticated) {
      router.replace("/");
      return;
    }

    if (!isAuthenticated) {
      return;
    }

    loadBooking();
    // bookingId and auth state are the actual reload triggers for this page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authReady, bookingId, isAuthenticated, router]);

  useEffect(() => {
    if (!confirmOpen) {
      setEmailInput("");
    }
  }, [confirmOpen]);

  async function handleConfirm() {
    if (!booking) return;

    if (!canConfirm) {
      handleApiError(new Error("Ingresa el correo de tu cuenta para confirmar la reserva."));
      return;
    }

    setIsSubmitting("confirm");
    try {
      await runWithAuth(() => confirmBooking(booking.bookingId));
      setConfirmOpen(false);
      toast.success("Reserva confirmada.");
      loadBooking();
    } catch (err) {
      handleApiError(err, "No se pudo confirmar la reserva en este momento.");
    } finally {
      setIsSubmitting(null);
    }
  }

  async function handleCancel() {
    if (!booking) return;

    setIsSubmitting("cancel");
    try {
      await runWithAuth(() =>
        cancelBooking(booking.bookingId, DEFAULT_CANCELLATION_REASON),
      );
      setCancelOpen(false);
      toast.success("Reserva cancelada.");
      loadBooking();
    } catch (err) {
      handleApiError(err, "No se pudo cancelar la reserva en este momento.");
    } finally {
      setIsSubmitting(null);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-3">
        <Button asChild type="button" size="sm" variant="ghost" className="w-fit">
          <Link href="/account/bookings">
            <ArrowLeft className="h-4 w-4" />
            Volver a mis reservas
          </Link>
        </Button>

        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">
              Reserva
            </p>
            <h1 className="text-3xl font-semibold text-foreground">
              {booking?.bookingNumber || "Detalle de reserva"}
            </h1>
          </div>

          {booking && (
            <span className="inline-flex w-fit rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              {getUserBookingStatusLabel(booking.status)}
            </span>
          )}
        </div>
      </div>

      {isLoading && (
        <Card>
          <CardContent className="p-4 text-sm text-muted-foreground">
            Cargando detalle de reserva...
          </CardContent>
        </Card>
      )}

      {!isLoading && !booking && (
        <Card>
          <CardContent className="p-4 text-sm text-muted-foreground">
            No se encontro la reserva solicitada.
          </CardContent>
        </Card>
      )}

      {!isLoading && booking && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>{booking.hotelName || "Hotel sin nombre"}</CardTitle>
              <CardDescription>
                {booking.roomTypeName || "Habitacion"} · {formatDate(booking.checkIn)} -{" "}
                {formatDate(booking.checkOut)}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <DetailRow label="Noches" value={String(booking.nights)} />
              <DetailRow
                label="Huespedes"
                value={String(booking.numberOfGuests)}
              />
              <DetailRow
                label="Habitaciones"
                value={String(booking.numberOfRooms)}
              />
              <DetailRow
                label="Total"
                value={formatMoney(booking.totalAmount, booking.currency)}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Estado y seguimiento</CardTitle>
              <CardDescription>
                Fechas clave y acciones disponibles para esta reserva.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <DetailRow
                label="Creada"
                value={formatDateTime(booking.createdAt)}
              />
              <DetailRow
                label="Confirmada"
                value={formatDateTime(booking.confirmedAt)}
              />
              <DetailRow
                label="Cancelada"
                value={formatDateTime(booking.cancelledAt)}
              />
              <DetailRow
                label="Motivo cancelacion"
                value={booking.cancellationReason || "Sin cancelacion"}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Huesped principal</CardTitle>
              <CardDescription>
                Datos capturados al momento de crear la reserva.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              <DetailRow label="Nombre" value={booking.guestFullName} />
              <DetailRow label="Correo" value={booking.guestEmail} />
              <DetailRow label="Telefono" value={booking.guestPhoneNumber} />
              <DetailRow
                label="Documento"
                value={
                  booking.guestDocumentNumber
                    ? `${booking.guestDocumentType || "Documento"} ${booking.guestDocumentNumber}`
                    : "No registrado"
                }
              />
              <DetailRow
                label="Nacimiento"
                value={formatDate(booking.guestDateOfBirth)}
              />
              <DetailRow
                label="Nacionalidad"
                value={booking.guestNationality || "No registrada"}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notas</CardTitle>
              <CardDescription>
                Requerimientos y seguimiento operativo de la reserva.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="rounded-lg border border-border/60 p-4 text-sm text-foreground">
                {booking.specialRequests || "Sin solicitudes especiales."}
              </div>
              <Separator />
              <div className="flex flex-wrap gap-3">
                <Button type="button" variant="outline" onClick={() => loadBooking()}>
                  Actualizar detalle
                </Button>
                {booking.status === 0 && user?.email && (
                  <>
                    <Button
                      type="button"
                      onClick={() => setConfirmOpen(true)}
                    >
                      Confirmar reserva
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => setCancelOpen(true)}
                    >
                      Cancelar reserva
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {booking && user?.email && (
        <>
          <BookingActionDialog
            open={confirmOpen}
            onOpenChange={setConfirmOpen}
            title="Confirmar reserva"
            description={`Escribe ${user.email} para confirmar ${booking.bookingNumber}.`}
            confirmLabel="Confirmar reserva"
            confirmDisabled={!canConfirm}
            confirmLoading={isSubmitting === "confirm"}
            onConfirm={handleConfirm}
          >
            <div className="grid gap-2">
              <label
                className="text-sm font-medium text-foreground"
                htmlFor="booking-detail-confirm-email"
              >
                Correo electronico
              </label>
              <Input
                id="booking-detail-confirm-email"
                type="email"
                value={emailInput}
                autoComplete="email"
                placeholder={user.email}
                onChange={(event) => setEmailInput(event.target.value)}
              />
            </div>
          </BookingActionDialog>

          <BookingActionDialog
            open={cancelOpen}
            onOpenChange={setCancelOpen}
            title="Cancelar reserva"
            description={`Se cancelara ${booking.bookingNumber}. Esta accion no se puede deshacer.`}
            confirmLabel="Si, cancelar"
            confirmVariant="destructive"
            confirmLoading={isSubmitting === "cancel"}
            onConfirm={handleCancel}
          />
        </>
      )}
    </main>
  );
}

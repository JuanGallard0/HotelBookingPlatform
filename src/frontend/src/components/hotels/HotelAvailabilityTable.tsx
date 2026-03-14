"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { format, parse, isValid } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, UserRound } from "lucide-react";
import { getHotelAvailability } from "@/src/lib/api/hotels";
import type { AvailableRoomTypeDto } from "@/src/lib/api/generated/api-client";
import { useAuth } from "@/src/context/AuthContext";
import { cn } from "@/src/lib/utils";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { Calendar } from "@/src/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";

function toDateOnly(d: Date) {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}

function tomorrow() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(0, 0, 0, 0);
  return d;
}

function today() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function DatePickerField({
  label,
  value,
  onChange,
  fromDate,
}: {
  label: string;
  value: string;
  onChange: (iso: string) => void;
  fromDate?: Date;
}) {
  const [open, setOpen] = useState(false);
  const selected = value ? parse(value, "yyyy-MM-dd", new Date()) : undefined;
  const isSelected = selected && isValid(selected);

  return (
    <div className="flex flex-col gap-1">
      <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(
              "flex h-9 w-36 items-center gap-2 rounded-md border border-input bg-background px-3 text-sm transition-colors hover:bg-accent",
              !isSelected && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="h-4 w-4 shrink-0 opacity-60" />
            {isSelected ? format(selected, "dd/MM/yyyy") : "dd/mm/yyyy"}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={isSelected ? selected : undefined}
            onSelect={(day) => {
              onChange(day ? format(day, "yyyy-MM-dd") : "");
              setOpen(false);
            }}
            disabled={{ before: fromDate ?? today() }}
            startMonth={fromDate ?? today()}
            locale={es}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}


export function HotelAvailabilityTable({ hotelId }: { hotelId: number }) {
  const router = useRouter();
  const { isAuthenticated, openModal } = useAuth();
  const [pendingUrl, setPendingUrl] = useState<string | null>(null);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);
  const [numberOfRooms, setNumberOfRooms] = useState(1);
  const [rooms, setRooms] = useState<AvailableRoomTypeDto[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const fetchAvailability = useCallback(
    async (ci: string, co: string, g: number, r: number) => {
      setLoading(true);
      setError(null);
      try {
        const dto = await getHotelAvailability(
          hotelId,
          new Date(ci),
          new Date(co),
          g,
          r,
        );
        setRooms(dto.availableRoomTypes ?? []);
      } catch {
        setError("No se pudo cargar la disponibilidad. Intenta de nuevo.");
        setRooms(null);
      } finally {
        setLoading(false);
        setSearched(true);
      }
    },
    [hotelId],
  );

  useEffect(() => {
    if (!checkIn || !checkOut) return;
    fetchAvailability(checkIn, checkOut, guests, numberOfRooms);
  }, [checkIn, checkOut, guests, numberOfRooms, fetchAvailability]);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!checkIn || !checkOut) return;
    await fetchAvailability(checkIn, checkOut, guests, numberOfRooms);
  }

  function handleClear() {
    setCheckIn("");
    setCheckOut("");
    setGuests(1);
    setNumberOfRooms(1);
    setRooms(null);
    setSearched(false);
    setError(null);
  }

  function buildBookingUrl(room: AvailableRoomTypeDto) {
    const params = new URLSearchParams({
      roomTypeId: String(room.roomTypeId ?? ""),
      checkIn,
      checkOut,
      guests: String(guests),
      numberOfRooms: String(numberOfRooms),
      roomName: room.name ?? "",
      totalPrice: String(room.totalPrice ?? room.pricePerNight ?? 0),
      currency: room.currency ?? "",
      hotelId: String(hotelId),
    });
    return `/bookings/new?${params.toString()}`;
  }

  function handleReservar(room: AvailableRoomTypeDto) {
    const url = buildBookingUrl(room);
    if (isAuthenticated) {
      router.push(url);
    } else {
      setPendingUrl(url);
    }
  }

  const minCheckOutDate = (() => {
    if (!checkIn) return tomorrow();
    const d = parse(checkIn, "yyyy-MM-dd", new Date());
    d.setDate(d.getDate() + 1);
    return d;
  })();

  return (
    <section id="availability" className="mt-10">
      {/* Login prompt dialog */}
      <Dialog
        open={pendingUrl !== null}
        onOpenChange={(open) => {
          if (!open) setPendingUrl(null);
        }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Inicia sesión para continuar</DialogTitle>
            <DialogDescription>
              Necesitas una cuenta para realizar una reserva. ¿Quieres iniciar
              sesión ahora?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setPendingUrl(null)}>
              Cancelar
            </Button>
            <Button
              onClick={() => {
                setPendingUrl(null);
                openModal("login");
              }}
            >
              Iniciar sesión
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-border">
          <h2 className="text-xl font-semibold text-card-foreground">
            Disponibilidad de habitaciones
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Selecciona fechas y número de huéspedes para consultar
            disponibilidad.
          </p>
        </div>

        {/* Filter form */}
        <form
          onSubmit={handleSearch}
          className="px-6 py-5 border-b border-border bg-muted/30"
        >
          <div className="flex flex-wrap gap-4 items-end">
            <DatePickerField
              label="Check-in"
              value={checkIn}
              onChange={(v) => {
                setCheckIn(v);
                if (v >= checkOut) {
                  const next = new Date(v);
                  next.setUTCDate(next.getUTCDate() + 1);
                  setCheckOut(toDateOnly(next));
                }
              }}
            />

            <DatePickerField
              label="Check-out"
              value={checkOut}
              onChange={setCheckOut}
              fromDate={minCheckOutDate}
            />

            <div className="flex flex-col gap-1">
              <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Huéspedes
              </Label>
              <Input
                type="number"
                required
                min={1}
                max={20}
                value={guests}
                onChange={(e) => setGuests(Number(e.target.value))}
                className="w-24"
              />
            </div>

            <div className="flex flex-col gap-1">
              <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Habitaciones
              </Label>
              <Input
                type="number"
                required
                min={1}
                max={20}
                value={numberOfRooms}
                onChange={(e) => setNumberOfRooms(Number(e.target.value))}
                className="w-24"
              />
            </div>

            <Button
              type="button"
              variant="outline"
              disabled={loading}
              onClick={handleClear}
            >
              Limpiar
            </Button>
          </div>
        </form>

        {/* Results */}
        {error && <p className="px-6 py-6 text-sm text-red-600">{error}</p>}

        {searched && !error && rooms !== null && rooms.length === 0 && (
          <p className="px-6 py-6 text-sm text-slate-500">
            No hay habitaciones disponibles para los criterios seleccionados.
          </p>
        )}

        {rooms && rooms.length > 0 && (
          <>
            {/* ── Mobile cards (< md) ── */}
            <div className="md:hidden divide-y divide-border">
              {rooms.map((room) => {
                const discount = room.discountPercentage ?? 0;
                const base = room.pricePerNight ?? 0;
                const total = room.totalPrice ?? base * (1 - discount / 100);
                const available = room.availableRooms ?? 0;
                return (
                  <div
                    key={room.roomTypeId}
                    className="px-5 py-5 flex flex-col gap-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-card-foreground">
                          {room.name}
                        </p>
                        {room.description && (
                          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                            {room.description}
                          </p>
                        )}
                      </div>
                      <Badge
                        className={`shrink-0 ${available > 0 ? "bg-green-100 text-green-700 hover:bg-green-100" : "bg-red-100 text-red-600 hover:bg-red-100"}`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${available > 0 ? "bg-green-500" : "bg-red-500"}`}
                        />
                        {available > 0 ? `${available} disp.` : "Agotado"}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <UserRound className="h-3.5 w-3.5" strokeWidth={1.8} />
                        {room.maxOccupancy} huéspedes
                      </span>
                      {discount > 0 && (
                        <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">
                          -{discount}%
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-end justify-between">
                      <div>
                        {discount > 0 && (
                          <p className="text-xs text-muted-foreground line-through">
                            {base.toFixed(2)} {room.currency} / noche
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {discount === 0
                            ? `${base.toFixed(2)} ${room.currency} / noche`
                            : ""}
                        </p>
                        <p className="text-lg font-bold text-card-foreground">
                          {total.toFixed(2)} {room.currency}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          precio total
                        </p>
                      </div>
                      <Button
                        size="sm"
                        disabled={available === 0}
                        onClick={() => handleReservar(room)}
                      >
                        Reservar
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ── Desktop table (>= md) ── */}
            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="py-4 text-sm">Habitación</TableHead>
                    <TableHead className="py-4 text-center text-sm">
                      Capacidad
                    </TableHead>
                    <TableHead className="py-4 text-center text-sm">
                      Disponibles
                    </TableHead>
                    <TableHead className="py-4 text-right text-sm">
                      Precio / noche
                    </TableHead>
                    <TableHead className="py-4 text-right text-sm">
                      Descuento
                    </TableHead>
                    <TableHead className="py-4 text-right text-sm">
                      Total estancia
                    </TableHead>
                    <TableHead className="py-4 text-center text-sm">
                      Acción
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rooms.map((room) => {
                    const discount = room.discountPercentage ?? 0;
                    const base = room.pricePerNight ?? 0;
                    const total =
                      room.totalPrice ?? base * (1 - discount / 100);
                    const available = room.availableRooms ?? 0;
                    return (
                      <TableRow key={room.roomTypeId} className="align-top">
                        <TableCell className="py-5 max-w-sm">
                          <p className="text-sm font-semibold text-card-foreground">
                            {room.name}
                          </p>
                          {room.description && (
                            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                              {room.description}
                            </p>
                          )}
                        </TableCell>
                        <TableCell className="py-5 text-center">
                          <span className="inline-flex items-center gap-1.5 text-sm text-foreground">
                            <UserRound
                              className="h-4 w-4 text-muted-foreground"
                              strokeWidth={1.8}
                            />
                            {room.maxOccupancy} huéspedes
                          </span>
                        </TableCell>
                        <TableCell className="py-5 text-center">
                          <Badge
                            className={
                              available > 0
                                ? "bg-green-100 text-green-700 hover:bg-green-100"
                                : "bg-red-100 text-red-600 hover:bg-red-100"
                            }
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${available > 0 ? "bg-green-500" : "bg-red-500"}`}
                            />
                            {available > 0
                              ? `${available} disponibles`
                              : "Sin disponibilidad"}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-5 text-right">
                          <p
                            className={`text-sm font-medium ${discount > 0 ? "text-muted-foreground line-through" : "text-card-foreground"}`}
                          >
                            {base.toFixed(2)} {room.currency}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            por noche
                          </p>
                        </TableCell>
                        <TableCell className="py-5 text-right">
                          {discount > 0 ? (
                            <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">
                              -{discount}%
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              —
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="py-5 text-right">
                          <p className="text-base font-bold text-card-foreground">
                            {total.toFixed(2)} {room.currency}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            precio total
                          </p>
                        </TableCell>
                        <TableCell className="py-5 text-center">
                          <Button
                            size="sm"
                            disabled={available === 0}
                            onClick={() => handleReservar(room)}
                          >
                            Reservar
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </div>
    </section>
  );
}


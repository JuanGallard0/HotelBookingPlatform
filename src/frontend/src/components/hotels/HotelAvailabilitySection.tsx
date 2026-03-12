"use client";

import { useState, useEffect, useCallback } from "react";
import { HotelAvailabilityDto } from "@/src/lib/api/generated/api-client";
import type { AvailableRoomTypeDto } from "@/src/lib/api/generated/api-client";

function toDateOnly(d: Date) {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}

function defaultDates() {
  const now = new Date();
  const checkIn = new Date(
    Date.UTC(now.getFullYear(), now.getMonth(), now.getDate() + 1),
  );
  const checkOut = new Date(
    Date.UTC(now.getFullYear(), now.getMonth(), now.getDate() + 2),
  );
  return { checkIn: toDateOnly(checkIn), checkOut: toDateOnly(checkOut) };
}

export function HotelAvailabilitySection({ hotelId }: { hotelId: number }) {
  const defaults = defaultDates();
  const [checkIn, setCheckIn] = useState(defaults.checkIn);
  const [checkOut, setCheckOut] = useState(defaults.checkOut);
  const [guests, setGuests] = useState(1);
  const [rooms, setRooms] = useState<AvailableRoomTypeDto[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const fetchAvailability = useCallback(
    async (ci: string, co: string, g: number) => {
      setLoading(true);
      setError(null);
      try {
        const url =
          `/api/v1/hotels/${hotelId}/availability` +
          `?HotelId=${hotelId}&CheckIn=${ci}&CheckOut=${co}&NumberOfGuests=${g}`;
        const res = await fetch(url);
        const json = await res.json();
        if (!json.success || !json.data) {
          throw new Error(json.errorMessage ?? "Error");
        }
        const dto = HotelAvailabilityDto.fromJS(json.data);
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
    const d = defaultDates();
    fetchAvailability(d.checkIn, d.checkOut, 1);
  }, [fetchAvailability]);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    await fetchAvailability(checkIn, checkOut, guests);
  }

  function handleClear() {
    const d = defaultDates();
    setCheckIn(d.checkIn);
    setCheckOut(d.checkOut);
    setGuests(1);
    fetchAvailability(d.checkIn, d.checkOut, 1);
  }

  return (
    <section id="availability" className="mt-10">
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100">
          <h2 className="text-xl font-semibold text-slate-900">
            Disponibilidad de habitaciones
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Selecciona fechas y número de huéspedes para consultar
            disponibilidad.
          </p>
        </div>

        {/* Filter form */}
        <form
          onSubmit={handleSearch}
          className="px-6 py-5 border-b border-slate-100 bg-slate-50"
        >
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Check-in
              </label>
              <input
                type="date"
                required
                value={checkIn}
                min={toDateOnly(new Date())}
                onChange={(e) => {
                  setCheckIn(e.target.value);
                  if (e.target.value >= checkOut) {
                    const next = new Date(e.target.value);
                    next.setUTCDate(next.getUTCDate() + 1);
                    setCheckOut(toDateOnly(next));
                  }
                }}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Check-out
              </label>
              <input
                type="date"
                required
                value={checkOut}
                min={checkIn}
                onChange={(e) => setCheckOut(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Huéspedes
              </label>
              <input
                type="number"
                required
                min={1}
                max={20}
                value={guests}
                onChange={(e) => setGuests(Number(e.target.value))}
                className="w-24 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Buscando…" : "Buscar"}
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={handleClear}
              className="rounded-lg border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Limpiar
            </button>
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
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-xs font-medium uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-6 py-4 text-left">Habitación</th>
                  <th className="px-6 py-4 text-center">Capacidad</th>
                  <th className="px-6 py-4 text-center">Disponibles</th>
                  <th className="px-6 py-4 text-right">Precio / noche</th>
                  <th className="px-6 py-4 text-right">Precio final</th>
                  <th className="px-6 py-4 text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rooms.map((room) => {
                  const discount = room.discountPercentage ?? 0;
                  const base = room.pricePerNight ?? 0;
                  const final =
                    discount > 0 ? base * (1 - discount / 100) : null;
                  const available = room.availableRooms ?? 0;
                  return (
                    <tr
                      key={room.roomTypeId}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-6 py-6 max-w-xs">
                        <p className="font-semibold text-slate-900">
                          {room.name}
                        </p>
                        {room.description && (
                          <p className="mt-1 text-xs text-slate-500 line-clamp-2">
                            {room.description}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-6 text-center">
                        <span className="inline-flex items-center gap-1 text-slate-700">
                          <svg
                            className="h-4 w-4 text-slate-400"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={1.8}
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                            />
                          </svg>
                          {room.maxOccupancy}
                        </span>
                      </td>
                      <td className="px-6 py-6 text-center">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${
                            available > 0
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-600"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${available > 0 ? "bg-green-500" : "bg-red-500"}`}
                          />
                          {available > 0
                            ? `${available} disponibles`
                            : "Sin disponibilidad"}
                        </span>
                      </td>
                      <td className="px-6 py-6 text-right">
                        <p
                          className={`font-medium ${final ? "text-slate-400 line-through text-xs" : "text-slate-900"}`}
                        >
                          {base.toFixed(2)} {room.currency}
                        </p>
                        {discount > 0 && (
                          <span className="mt-1 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                            -{discount}%
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-6 text-right">
                        <p className="text-base font-bold text-slate-900">
                          {(final ?? base).toFixed(2)} {room.currency}
                        </p>
                        <p className="text-xs text-slate-400">por noche</p>
                      </td>
                      <td className="px-6 py-6 text-center">
                        <button
                          disabled={available === 0}
                          className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          Reservar
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

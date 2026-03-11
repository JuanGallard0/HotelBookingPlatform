"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function Hero() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (name) params.set("name", name);
    if (checkIn) params.set("checkIn", checkIn);
    if (checkOut) params.set("checkOut", checkOut);
    if (guests) params.set("numberOfGuests", guests);
    router.push(`/hotels?${params.toString()}`);
  }

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-br from-blue-700 via-blue-600 to-cyan-500" />
      <div className="absolute -left-24 top-24 h-72 w-72 rounded-full bg-white/15 blur-3xl" />
      <div className="absolute -right-20 bottom-8 h-72 w-72 rounded-full bg-cyan-200/30 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-100">
          Reserva inteligente
        </p>
        <h1 className="mt-2 max-w-3xl text-2xl font-bold leading-tight text-white sm:text-3xl lg:text-4xl">
          Encuentra el hotel ideal para tu proximo viaje
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-blue-50">
          Compara precios, revisa disponibilidad en tiempo real y gestiona tus
          reservas en un solo lugar, rapido y sin complicaciones.
        </p>

        <form
          onSubmit={handleSearch}
          className="mt-5 flex flex-col gap-3 rounded-2xl bg-white/10 p-4 backdrop-blur-sm sm:flex-row sm:items-end"
        >
          <div className="flex flex-1 flex-col gap-1">
            <label className="text-xs font-semibold uppercase tracking-wide text-blue-100">
              Hotel
            </label>
            <input
              type="text"
              placeholder="Nombre del hotel"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-lg border-0 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold uppercase tracking-wide text-blue-100">
              Entrada
            </label>
            <input
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="rounded-lg border-0 bg-white px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold uppercase tracking-wide text-blue-100">
              Salida
            </label>
            <input
              type="date"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className="rounded-lg border-0 bg-white px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold uppercase tracking-wide text-blue-100">
              Huespedes
            </label>
            <input
              type="number"
              min={1}
              placeholder="1"
              value={guests}
              onChange={(e) => setGuests(e.target.value)}
              className="w-24 rounded-lg border-0 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>

          <button
            type="submit"
            className="rounded-lg bg-white px-6 py-2.5 text-sm font-semibold text-blue-700 shadow-md transition-colors hover:bg-blue-50"
          >
            Buscar
          </button>
        </form>
      </div>
    </section>
  );
}

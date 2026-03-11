"use client";

import { HotelSearchBar } from "@/src/components/hotels/HotelSearchBar";

export function Hero() {
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
          reservas en un solo lugar, rápido y sin complicaciones.
        </p>

        <HotelSearchBar className="mt-5 rounded-2xl bg-white/10 p-4 backdrop-blur-sm" />
      </div>
    </section>
  );
}

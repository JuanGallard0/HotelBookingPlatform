"use client";

import { useEffect, useRef, useState } from "react";

interface Hotel {
  id: number;
  name: string;
  city: string;
  country: string;
  starRating: number;
  description: string;
  activeRoomTypeCount: number;
}

// Fetches through a Next.js route handler proxy so the browser stays same-origin.
const API_BASE = "/api/v1";

function StarRating({ stars }: { stars: number }) {
  return (
    <span className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className={`h-3.5 w-3.5 ${i < stars ? "text-amber-400" : "text-slate-200"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </span>
  );
}

function HotelCard({ hotel }: { hotel: Hotel }) {
  return (
    <div className="flex w-64 shrink-0 flex-col rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="flex h-36 items-center justify-center rounded-t-2xl bg-linear-to-br from-blue-100 to-cyan-100">
        <span className="text-4xl">🏨</span>
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-1 font-semibold text-slate-900">
            {hotel.name}
          </h3>
          <StarRating stars={hotel.starRating} />
        </div>
        <p className="text-xs text-slate-500">
          {hotel.city}, {hotel.country}
        </p>
        <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-600">
          {hotel.description}
        </p>
        <p className="mt-auto pt-3 text-xs text-slate-400">
          {hotel.activeRoomTypeCount} tipo
          {hotel.activeRoomTypeCount !== 1 ? "s" : ""} de habitacion
        </p>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="w-64 shrink-0 animate-pulse rounded-2xl border border-slate-200 bg-white">
      <div className="h-36 rounded-t-2xl bg-slate-100" />
      <div className="p-4 space-y-2">
        <div className="h-4 w-3/4 rounded bg-slate-100" />
        <div className="h-3 w-1/2 rounded bg-slate-100" />
        <div className="h-3 w-full rounded bg-slate-100" />
        <div className="h-3 w-5/6 rounded bg-slate-100" />
      </div>
    </div>
  );
}

export function HotelsCarousel() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(
      `${API_BASE}/hotels?PageSize=10&SortBy=name&SortDirection=asc&IsActive=true`,
    )
      .then((r) => r.json())
      .then((json) => {
        const items: Hotel[] = (json?.data?.data ?? []).map(
          (h: Record<string, unknown>) => ({
            id: h["id"] as number,
            name: h["name"] as string,
            city: h["city"] as string,
            country: h["country"] as string,
            starRating: (h["starRating"] as number) ?? 0,
            description: h["description"] as string,
            activeRoomTypeCount: (h["activeRoomTypeCount"] as number) ?? 0,
          }),
        );
        setHotels(items);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  function scroll(dir: "left" | "right") {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({
      left: dir === "left" ? -288 : 288,
      behavior: "smooth",
    });
  }

  if (error) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Hoteles destacados
          </h2>
          <p className="text-sm text-slate-500">
            Explora nuestra seleccion de alojamientos
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => scroll("left")}
            aria-label="Anterior"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
          >
            ‹
          </button>
          <button
            onClick={() => scroll("right")}
            aria-label="Siguiente"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
          >
            ›
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide"
        style={{ scrollbarWidth: "none" }}
      >
        {loading
          ? Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
          : hotels.map((hotel) => <HotelCard key={hotel.id} hotel={hotel} />)}
      </div>
    </section>
  );
}

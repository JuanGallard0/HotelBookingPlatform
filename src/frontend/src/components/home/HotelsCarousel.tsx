"use client";

import { useEffect, useRef, useState } from "react";
import { HotelCarouselCard } from "@/src/components/hotels/HotelCarouselCard";
import type { Hotel } from "@/src/components/hotels/HotelListCard";
import { HotelsClient } from "@/src/lib/api/generated/api-client";

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
    new HotelsClient()
      .getAvailableHotels(
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        1,
        10,
        "Name",
        "asc",
      )
      .then((response) => {
        setHotels(response.data?.data ?? []);
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
          : hotels.map((hotel) => (
              <HotelCarouselCard key={hotel.id} hotel={hotel} />
            ))}
      </div>
    </section>
  );
}

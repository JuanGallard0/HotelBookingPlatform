"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  HotelListCard,
  type Hotel,
} from "@/src/components/hotels/HotelListCard";
import {
  HotelFilters,
  type HotelFilterValues,
} from "@/src/components/hotels/HotelFilters";

function SkeletonRow() {
  return (
    <div className="flex gap-5 rounded-2xl border border-slate-200 bg-white p-4 animate-pulse">
      <div className="h-28 w-36 shrink-0 rounded-xl bg-slate-100" />
      <div className="flex flex-1 flex-col gap-2 py-1">
        <div className="h-4 w-1/2 rounded bg-slate-100" />
        <div className="h-3 w-1/3 rounded bg-slate-100" />
        <div className="h-3 w-full rounded bg-slate-100" />
        <div className="h-3 w-4/5 rounded bg-slate-100" />
      </div>
    </div>
  );
}

const PAGE_SIZE = 10;

const SORT_OPTIONS = [
  { value: "Name", label: "Nombre" },
  { value: "StarRating", label: "Estrellas" },
  { value: "City", label: "Ciudad" },
  { value: "Country", label: "País" },
] as const;

type SortOption = (typeof SORT_OPTIONS)[number]["value"];

export function HotelCatalog() {
  const searchParams = useSearchParams();
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<SortOption>("Name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [filters, setFilters] = useState<HotelFilterValues>({
    country: "",
    city: "",
    starRating: null,
  });
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const canLoadMoreRef = useRef(false);

  // Derived state: reset page to 1 when search filters change.
  // Calling setState during render is React's recommended pattern for
  // deriving state from incoming "props" changes (no effect needed).
  const [prevSearchStr, setPrevSearchStr] = useState(() =>
    searchParams.toString(),
  );
  const currentSearchStr = searchParams.toString();
  if (currentSearchStr !== prevSearchStr) {
    setPrevSearchStr(currentSearchStr);
    setPage(1);
  }

  // fetchKey encodes everything that should trigger a new fetch.
  // loading is derived: true whenever the last resolved key differs from
  // what we currently need — no setLoading(true) inside any effect.
  const fetchKey = `${currentSearchStr}|${page}|${sortBy}|${sortDir}|${filters.country}|${filters.city}|${filters.starRating ?? ""}`;
  const loading = loadedKey !== fetchKey;

  useEffect(() => {
    canLoadMoreRef.current = !loading && hotels.length < total;
  }, [loading, hotels, total]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && canLoadMoreRef.current) {
          setPage((p) => p + 1);
        }
      },
      { rootMargin: "150px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const parts = fetchKey.split("|");
    const effectiveStarRating = parts[parts.length - 1];
    const effectiveCity = parts[parts.length - 2];
    const effectiveCountry = parts[parts.length - 3];
    const effectiveSortDir = parts[parts.length - 4];
    const effectiveSortBy = parts[parts.length - 5];
    const effectivePage = parseInt(parts[parts.length - 6], 10);
    const sp = new URLSearchParams(parts.slice(0, -6).join("|"));

    const query = new URLSearchParams();
    query.set("PageSize", String(PAGE_SIZE));
    query.set("PageNumber", String(effectivePage));
    query.set("SortBy", effectiveSortBy);
    query.set("SortDirection", effectiveSortDir);
    query.set("IsActive", "true");

    if (effectiveCountry) query.set("country", effectiveCountry);
    if (effectiveCity) query.set("city", effectiveCity);
    if (effectiveStarRating) query.set("starRating", effectiveStarRating);

    const name = sp.get("name");
    const checkIn = sp.get("checkIn");
    const checkOut = sp.get("checkOut");
    const numberOfGuests = sp.get("numberOfGuests");

    if (name) query.set("name", name);
    if (checkIn) query.set("checkIn", checkIn);
    if (checkOut) query.set("checkOut", checkOut);
    if (numberOfGuests) query.set("numberOfGuests", numberOfGuests);

    fetch(`/api/v1/hotels?${query.toString()}`)
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
        setHotels((prev) =>
          effectivePage === 1 ? items : [...prev, ...items],
        );
        setTotal(json?.data?.totalRecords ?? items.length);
        setLoadedKey(fetchKey);
      })
      .catch(() => {
        setHotels([]);
        setLoadedKey(fetchKey);
      });
  }, [fetchKey]);

  return (
    <div className="flex gap-6 items-start">
      <aside className="hidden w-52 shrink-0 lg:block">
        <HotelFilters
          values={filters}
          onChange={(v) => {
            setFilters(v);
            setPage(1);
          }}
        />
      </aside>

      <div className="flex flex-1 flex-col gap-4">
        {/* Initial loading */}
        {loading && hotels.length === 0 && (
          <>
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </>
        )}

        {/* Empty state */}
        {!loading && hotels.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-20 text-slate-400">
            <span className="text-5xl">🔍</span>
            <p className="text-lg font-medium">No se encontraron hoteles</p>
            <p className="text-sm">Intenta con otros filtros de busqueda</p>
          </div>
        )}

        {/* Results header */}
        {hotels.length > 0 && (
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-slate-500">
              {total} hotel{total !== 1 ? "es" : ""} encontrado
              {total !== 1 ? "s" : ""}
            </p>
            <div className="flex items-center gap-2">
              <label
                htmlFor="sort-select"
                className="text-xs font-medium text-slate-500"
              >
                Ordenar por
              </label>
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value as SortOption);
                  setPage(1);
                }}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <button
                onClick={() => {
                  setSortDir((d) => (d === "asc" ? "desc" : "asc"));
                  setPage(1);
                }}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
                aria-label={
                  sortDir === "asc" ? "Orden ascendente" : "Orden descendente"
                }
                title={sortDir === "asc" ? "Ascendente" : "Descendente"}
              >
                {sortDir === "asc" ? "↑" : "↓"}
              </button>
            </div>
          </div>
        )}

        {hotels.map((hotel) => (
          <HotelListCard key={hotel.id} hotel={hotel} />
        ))}

        {/* Sentinel — always in the DOM so the observer can attach */}
        <div ref={sentinelRef} className="h-px" />
        {loading && hotels.length > 0 && <SkeletonRow />}
        {!loading && hotels.length > 0 && hotels.length >= total && (
          <p className="py-4 text-center text-sm text-slate-400">
            — Fin de los resultados —
          </p>
        )}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowDown, ArrowUp } from "lucide-react";
import { HotelsClient } from "@/src/lib/api/generated/api-client";
import {
  HotelListCard,
  type Hotel,
} from "@/src/components/hotels/HotelListCard";
import {
  HotelFilters,
  type HotelFilterValues,
} from "@/src/components/hotels/HotelFilters";
import { Button } from "@/src/components/ui/button";
import { Skeleton } from "@/src/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/src/components/ui/sheet";
import { SlidersHorizontal } from "lucide-react";

/** Returns a Date whose .toISOString() yields "YYYY-MM-DD" (no time/timezone). */
function toDateOnly(iso: string): Date {
  const d = new Date(iso);
  d.toISOString = () => iso;
  return d;
}

function SkeletonRow() {
  return (
    <div className="flex gap-5 rounded-2xl border border-border p-4">
      <Skeleton className="min-h-32 w-40 shrink-0 rounded-xl" />
      <div className="flex flex-1 flex-col gap-2 py-1">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
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
  const searchKey = searchParams.toString();
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<SortOption>("Name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [filters, setFilters] = useState<HotelFilterValues>({
    starRating: null,
  });
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const canLoadMoreRef = useRef(false);
  const requestSequenceRef = useRef(0);
  const [prevSearchStr, setPrevSearchStr] = useState(searchKey);
  if (searchKey !== prevSearchStr) {
    setPrevSearchStr(searchKey);
    setPage(1);
    if (hotels.length > 0) {
      setHotels([]);
      setTotal(0);
      setLoadedKey(null);
    }
  }

  // fetchKey encodes everything that should trigger a new fetch.
  // loading is derived: true whenever the last resolved key differs from
  // what we currently need — no setLoading(true) inside any effect.
  const fetchKey = `${searchKey}|${page}|${sortBy}|${sortDir}|${filters.starRating ?? ""}`;
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
    let cancelled = false;
    const requestId = ++requestSequenceRef.current;
    const sp = new URLSearchParams(searchKey);
    const checkIn = sp.get("checkIn")
      ? toDateOnly(sp.get("checkIn")!)
      : undefined;
    const checkOut = sp.get("checkOut")
      ? toDateOnly(sp.get("checkOut")!)
      : undefined;
    const numberOfGuests = sp.get("numberOfGuests")
      ? parseInt(sp.get("numberOfGuests")!, 10)
      : undefined;
    const numberOfRooms = sp.get("numberOfRooms")
      ? parseInt(sp.get("numberOfRooms")!, 10)
      : undefined;

    new HotelsClient()
      .getAvailableHotels(
        sp.get("search") ?? undefined,
        filters.starRating ?? undefined,
        checkIn,
        checkOut,
        numberOfGuests,
        numberOfRooms,
        page,
        PAGE_SIZE,
        sortBy,
        sortDir,
      )
      .then((response) => {
        if (cancelled || requestId !== requestSequenceRef.current) {
          return;
        }
        const items = response.data?.data ?? [];
        setHotels((prev) => {
          if (page === 1) {
            return items;
          }

          const seenHotelIds = new Set(prev.map((hotel) => hotel.hotelId));
          const nextItems = items.filter(
            (hotel) => !seenHotelIds.has(hotel.hotelId),
          );
          return [...prev, ...nextItems];
        });
        setTotal(response.data?.totalRecords ?? items.length);
        setLoadedKey(fetchKey);
      })
      .catch(() => {
        if (cancelled || requestId !== requestSequenceRef.current) {
          return;
        }
        setHotels([]);
        setLoadedKey(fetchKey);
      });

    return () => {
      cancelled = true;
    };
  }, [fetchKey, filters.starRating, page, searchKey, sortBy, sortDir]);

  return (
    <div className="flex gap-6 items-start">
      {/* Desktop sidebar */}
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
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {/* Mobile filter trigger */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="lg:hidden flex items-center gap-1.5"
                  >
                    <SlidersHorizontal className="h-3.5 w-3.5" />
                    Filtros
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-72 overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle>Filtros</SheetTitle>
                  </SheetHeader>
                  <div className="mt-4">
                    <HotelFilters
                      values={filters}
                      onChange={(v) => {
                        setFilters(v);
                        setPage(1);
                      }}
                    />
                  </div>
                </SheetContent>
              </Sheet>
              <p className="text-sm text-slate-500">
                {total} hotel{total !== 1 ? "es" : ""} encontrado
                {total !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">
                Ordenar por
              </span>
              <Select
                value={sortBy}
                onValueChange={(v) => {
                  setSortBy(v as SortOption);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-36 h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => {
                  setSortDir((d) => (d === "asc" ? "desc" : "asc"));
                  setPage(1);
                }}
                aria-label={
                  sortDir === "asc" ? "Orden ascendente" : "Orden descendente"
                }
                title={sortDir === "asc" ? "Ascendente" : "Descendente"}
              >
                {sortDir === "asc" ? (
                  <ArrowUp className="h-4 w-4" />
                ) : (
                  <ArrowDown className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Mobile filter trigger when no results yet */}
        {hotels.length === 0 && !loading && (
          <div className="flex lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1.5"
                >
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  Filtros
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Filtros</SheetTitle>
                </SheetHeader>
                <div className="mt-4">
                  <HotelFilters
                    values={filters}
                    onChange={(v) => {
                      setFilters(v);
                      setPage(1);
                    }}
                  />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        )}

        {hotels.map((hotel) => (
          <HotelListCard key={hotel.hotelId} hotel={hotel} />
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
